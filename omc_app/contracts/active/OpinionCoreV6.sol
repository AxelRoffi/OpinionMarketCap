// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IOpinionCore.sol";
import "./interfaces/IFeeManager.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IMonitoringManager.sol";
import "./interfaces/ISecurityManager.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./interfaces/IOpinionCoreInternal.sol";
import "./interfaces/IOpinionExtensionsInternal.sol";
import "./interfaces/IOpinionAdminInternal.sol";
import "./structs/OpinionStructs.sol";
import "./libraries/ValidationLibrary.sol";
import "./libraries/PriceCalculator.sol";
import "./libraries/SelfExitLib.sol";
import "./interfaces/IValidationErrors.sol";

/**
 * @title OpinionCoreV6
 * @notice Identical to V5, plus restores the `SameOwner` guard in
 *         `submitAnswer`: the current answer owner can no longer re-buy their
 *         own slot. This guard existed in the original monolithic contract
 *         (and still lives in OpinionTradingLib) but was accidentally dropped
 *         when submitAnswer was re-inlined for the modular V2 rewrite, which
 *         let a single address wash-trade its own take. A genuine A->B->A
 *         bidding war between distinct addresses is still fully allowed.
 * @dev STORAGE-SAFE upgrade: no state variables added, removed, or reordered.
 *      Reuses the existing `SameOwner()` error from IOpinionMarketErrors — no
 *      new error or state. All V4/V5 economics preserved verbatim.
 */
contract OpinionCoreV6 is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCoreInternal,
    IOpinionMarketEvents,
    IOpinionMarketErrors,
    IValidationErrors
{
    using SafeERC20 for IERC20;

    // ─── ROLES (preserved from V3) ──────────────────────────────────────
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    // Internal plumbing role: granted at initialize, never read by FE/tools and
    // its only modifier (onlyMarketContract) is applied to no function. Kept
    // `internal` to drop a dead public getter and reclaim bytecode for `link`.
    bytes32 internal constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    // Plumbing roles for linked contracts (used only by onlyLinkedContracts +
    // initialize grants, never read by FE). `internal` drops their dead getters.
    bytes32 internal constant EXTENSION_CONTRACT_ROLE = keccak256("EXTENSION_CONTRACT_ROLE");
    bytes32 internal constant ADMIN_CONTRACT_ROLE = keccak256("ADMIN_CONTRACT_ROLE");

    // ─── CONSTANTS (preserved from V3) ──────────────────────────────────
    uint256 public constant MAX_QUESTION_LENGTH = 60;
    uint256 public constant MAX_ANSWER_LENGTH = 60;
    uint256 public constant MAX_LINK_LENGTH = 260;
    // The next three are unused on-chain (kept for documentation parity with V4).
    // Declared `internal` in V5 to drop their public getters and reclaim the
    // bytecode the new `link` parameter needed to stay under Base's 24KB limit.
    uint256 internal constant MAX_IPFS_HASH_LENGTH = 68;
    uint256 internal constant MAX_DESCRIPTION_LENGTH = 280;
    uint256 internal constant MAX_CATEGORIES_PER_OPINION = 3;
    uint96 public constant MIN_INITIAL_PRICE = 1_000_000;

    // ─── V4 BOUNDS (admin setters cannot exceed these) ──────────────────
    // Internal to avoid generating public getters (saves bytecode).
    uint16 internal constant MAX_EXIT_PENALTY_BPS = 5000;
    uint16 internal constant MIN_EXIT_PENALTY_BPS = 500;
    uint32 internal constant MAX_COOLDOWN = 90 days;
    /// @dev Lower bound on admin-settable cooldown. 60s permits live testing
    ///      of the self-exit flow without waiting through a real 14-day cycle.
    ///      Production cooldown is set to 14 days at initializeV4(); admin can
    ///      temporarily lower for live tests, then restore.
    uint32 internal constant MIN_COOLDOWN = 60;
    uint16 internal constant MIN_RECLAIM_DISCOUNT_BPS = 1000;
    uint16 internal constant MAX_RECLAIM_DISCOUNT_BPS = 9000;
    uint16 internal constant MAX_LARGE_HOLDER_THRESHOLD_BPS = 5000;
    uint16 internal constant BPS_DENOMINATOR = 10000;

    // ════════════════════════════════════════════════════════════════════
    // ─── V3 STATE (DO NOT REORDER — STORAGE LAYOUT MUST MATCH) ──────────
    // ════════════════════════════════════════════════════════════════════
    IERC20 public usdcToken;
    IFeeManager public feeManager;
    IPoolManager public poolManager;
    IMonitoringManager public monitoringManager;
    ISecurityManager public securityManager;
    IOpinionExtensionsInternal public extensionsContract;
    IOpinionAdminInternal public adminContract;

    uint256 public nextOpinionId;

    uint256 public maxTradesPerBlock;
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;

    uint256 private nonce;
    mapping(uint256 => uint256) private priceMetadata;
    mapping(uint256 => uint256) private priceHistory;

    uint96 public minimumPrice;
    uint96 public questionCreationFee;
    uint96 public initialAnswerPrice;
    uint256 public absoluteMaxPriceChange;
    uint96 public maxInitialPrice;

    mapping(uint256 => OpinionStructs.Opinion) public opinions;
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;

    // ════════════════════════════════════════════════════════════════════
    // ─── V4 STATE (APPENDED ONLY — NEVER MODIFY ABOVE THIS LINE) ────────
    // ════════════════════════════════════════════════════════════════════

    /// @notice Per-opinion locked USDC backing the current king's position.
    mapping(uint256 => uint96) public lockedStake;

    /// @notice Last trade timestamp per opinion. Cooldown clock starts here.
    mapping(uint256 => uint32) public lastTradeTimestamp;

    uint32 public soloCooldown;
    uint32 public poolCooldown;
    uint32 public poolExtendedCooldown;
    uint16 public exitPenaltyBps;
    uint16 public penaltyCreatorShareBps;
    uint16 public reclaimDiscountBps;
    uint16 public largeHolderThresholdBps;
    uint96 public minReclaimPrice;
    uint96 public spamFee;

    bool public selfExitEnabled;
    bool public reclaimVacantSlotEnabled;

    uint256[40] private __gapV4;

    // ════════════════════════════════════════════════════════════════════
    // ─── V4 EVENTS (mirrored in SelfExitLib for ABI completeness) ──────
    // ════════════════════════════════════════════════════════════════════
    event PriceCalculated(uint256 indexed opinionId, uint256 oldPrice, uint256 newPrice, uint256 nonce);
    event LockedStakeBootstrapped(uint256 indexed opinionId, uint96 amount);
    event SelfExitParameterUpdated(uint8 indexed paramType, uint256 newValue);
    /// @dev flagType 0=selfExit, 1=reclaim
    event SelfExitFlagToggled(uint8 indexed flagType, bool enabled);

    // SelfExitLib events (SelfExitTriggered, PenaltyDistributed, SlotVacated,
    // VacantSlotReclaimed, PoolStaleExitProcessed) are emitted from the library
    // via DELEGATECALL and land at this contract's address. Frontend tooling
    // should include both ABIs (OpinionCoreV5 + SelfExitLib) when decoding logs.

    // ─── V4 ERRORS ─────────────────────────────────────────────────────
    error FeatureDisabled();
    error PoolMustUsePoolExit();
    error SoloMustUseSoloExit();
    error SlotIsVacant();
    error InvalidParameterValue();

    // ─── MODIFIERS ─────────────────────────────────────────────────────
    modifier onlyMarketContract() {
        if (!hasRole(MARKET_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, MARKET_CONTRACT_ROLE);
        _;
    }

    modifier onlyPoolManager() {
        if (!hasRole(POOL_MANAGER_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, POOL_MANAGER_ROLE);
        _;
    }

    modifier onlyLinkedContracts() {
        if (!hasRole(EXTENSION_CONTRACT_ROLE, msg.sender) &&
            !hasRole(ADMIN_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, EXTENSION_CONTRACT_ROLE);
        _;
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── INITIALIZATION ─────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function initialize(
        address _usdcToken,
        address _opinionMarket,
        address _feeManager,
        address _poolManager,
        address _monitoringManager,
        address _securityManager,
        address /* _treasury */,
        address _extensionsContract,
        address _adminContract
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);

        if (
            _usdcToken == address(0) ||
            _opinionMarket == address(0) ||
            _feeManager == address(0) ||
            _poolManager == address(0) ||
            _extensionsContract == address(0) ||
            _adminContract == address(0)
        ) revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);
        extensionsContract = IOpinionExtensionsInternal(_extensionsContract);
        adminContract = IOpinionAdminInternal(_adminContract);

        _grantRole(MARKET_CONTRACT_ROLE, _opinionMarket);
        _grantRole(EXTENSION_CONTRACT_ROLE, _extensionsContract);
        _grantRole(ADMIN_CONTRACT_ROLE, _adminContract);

        if (_monitoringManager != address(0)) {
            monitoringManager = IMonitoringManager(_monitoringManager);
        }
        if (_securityManager != address(0)) {
            securityManager = ISecurityManager(_securityManager);
        }

        nextOpinionId = 1;
        maxTradesPerBlock = 0;
        minimumPrice = 1_000_000;
        questionCreationFee = 2_000_000;
        initialAnswerPrice = 1_000_000;
        absoluteMaxPriceChange = 200;
        maxInitialPrice = 100_000_000;
    }

    /**
     * @notice One-shot initializer for V4 upgrade. Sets default parameters.
     * @dev Must be called immediately after `upgradeProxy`. Idempotent.
     *      Feature flags start FALSE — admin must explicitly enable.
     *      Already executed on the live proxy under V4; retained for fresh
     *      deploys. V5 adds no new state, so no new initializer is needed.
     */
    function initializeV4() public reinitializer(2) onlyRole(ADMIN_ROLE) {
        soloCooldown = 14 days;
        poolCooldown = 21 days;
        poolExtendedCooldown = 35 days;
        exitPenaltyBps = 2000;
        penaltyCreatorShareBps = 5000;
        reclaimDiscountBps = 5000;
        largeHolderThresholdBps = 1000;
        minReclaimPrice = 2_000_000;
        spamFee = 2_000_000;
        selfExitEnabled = false;
        reclaimVacantSlotEnabled = false;
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── CORE OPINION FUNCTIONS ─────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new opinion under V4 economics: creator pre-funds the
     *         slot at `initialPrice`, plus a flat `spamFee` paid to treasury.
     * @dev `initialPrice` is locked in the contract; `spamFee` flows to treasury.
     *      V5: `link` (optional source URL, ≤ MAX_LINK_LENGTH) is now stored on
     *      the bootstrap answer instead of being hard-wired to "".
     */
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        string calldata link,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external nonReentrant whenNotPaused {
        if (!adminContract.isPublicCreationEnabled() && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        _basicValidation(question, answer, description, initialPrice, opinionCategories);
        if (bytes(link).length > MAX_LINK_LENGTH) {
            revert InvalidStringParameter("link", "Too long");
        }

        uint96 totalCost = initialPrice + spamFee;
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < totalCost) revert InsufficientAllowance(totalCost, allowance);

        // ─── EFFECTS ────────────────────────────────────────────────────
        uint256 opinionId = _createOpinionRecord(question, answer, description, link, initialPrice);
        lockedStake[opinionId] = initialPrice;
        lastTradeTimestamp[opinionId] = uint32(block.timestamp);

        // ─── INTERACTIONS ───────────────────────────────────────────────
        // Pull total in one call, then forward spamFee to treasury.
        usdcToken.safeTransferFrom(msg.sender, address(this), totalCost);
        if (spamFee > 0) {
            usdcToken.safeTransfer(adminContract.getTreasury(), spamFee);
        }

        extensionsContract.initializeOpinionCategories(opinionId, opinionCategories);

        emit LockedStakeBootstrapped(opinionId, initialPrice);
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionCreated(opinionId, question, answer, msg.sender, initialPrice, block.timestamp);
    }

    /**
     * @notice Buy the answer slot, dethroning the current king.
     * @dev Economics identical to V3 (95% to previous king, 5% to fees).
     *      V4 additions: writes `lastTradeTimestamp`. Locked stake CARRIES
     *      FORWARD unchanged because the math balances exactly.
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external payable nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        if (bytes(answer).length < 2 || bytes(answer).length > MAX_ANSWER_LENGTH) {
            revert InvalidStringParameter("answer", "Length out of bounds");
        }
        ValidationLibrary.validateDescription(description);
        if (bytes(link).length > MAX_LINK_LENGTH) {
            revert InvalidStringParameter("link", "Too long");
        }

        if (opinion.currentAnswerOwner == address(0)) revert SlotIsVacant();
        // V6: the current owner cannot re-buy their own slot (anti wash-trading).
        // Restores the original `SameOwner` guard dropped in the V2 modular rewrite.
        if (msg.sender == opinion.currentAnswerOwner) revert SameOwner();

        uint96 price = uint96(this.getNextPrice(opinionId));

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);

        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeManager.calculateFeeDistribution(price);
        address previousOwner = opinion.currentAnswerOwner;

        // ─── EFFECTS ────────────────────────────────────────────────────
        lastTradeTimestamp[opinionId] = uint32(block.timestamp);
        _updateOpinionState(opinion, opinionId, answer, description, link, price, msg.sender);
        _updatePriceMetadata(opinionId, price);

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: msg.sender,
                price: price,
                timestamp: uint32(block.timestamp)
            })
        );

        // ─── INTERACTIONS ───────────────────────────────────────────────
        usdcToken.safeTransferFrom(msg.sender, address(this), price);

        if (ownerAmount > 0) usdcToken.safeTransfer(previousOwner, ownerAmount);

        uint96 totalFees = platformFee + creatorFee;
        if (totalFees > 0) usdcToken.safeTransfer(address(feeManager), totalFees);
        if (creatorFee > 0) feeManager.accumulateFee(opinion.creator, creatorFee);

        emit OpinionAction(opinionId, 1, answer, msg.sender, price);
        emit OpinionAnswered(opinionId, answer, previousOwner, msg.sender, price, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── V4 SELF-EXIT FUNCTIONS ─────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Solo king exits a stale slot, recovering 80% of locked stake.
     *         OPTIONAL — king is never forced out. Cooldown only unlocks the option.
     * @dev Wrapper validates authorization & feature flag; library handles
     *      stake split, state writes, transfers, and event emission.
     */
    function selfExit(uint256 opinionId) external nonReentrant whenNotPaused {
        if (!selfExitEnabled) revert FeatureDisabled();
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        address king = opinion.currentAnswerOwner;
        if (king != msg.sender) revert NotTheOwner(msg.sender, king);
        if (hasRole(POOL_MANAGER_ROLE, king)) revert PoolMustUsePoolExit();

        SelfExitLib.processSelfExit(
            opinions,
            lockedStake,
            lastTradeTimestamp,
            usdcToken,
            feeManager,
            opinionId,
            king,
            soloCooldown,
            _exitConfig()
        );
    }

    /**
     * @notice Anyone may take an empty (post-exit) slot at a discount.
     */
    function reclaimVacantSlot(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external nonReentrant whenNotPaused {
        if (!reclaimVacantSlotEnabled) revert FeatureDisabled();
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // String validation happens inside the library to save bytecode here.
        uint96 reclaimPrice = SelfExitLib.processVacantReclaim(
            opinions,
            answerHistory,
            lockedStake,
            lastTradeTimestamp,
            usdcToken,
            feeManager,
            opinionId,
            msg.sender,
            answer,
            description,
            link,
            _exitConfig()
        );

        // Dynamic next-price must be calculated here (PriceCalculator needs
        // non-library state access via storage refs in this contract).
        opinion.nextPrice = uint96(_calculateNextPriceDynamic(opinionId, reclaimPrice));
        _updatePriceMetadata(opinionId, reclaimPrice);

        emit OpinionAction(opinionId, 1, answer, msg.sender, reclaimPrice);
    }

    /**
     * @notice Called by PoolManager to dissolve a pool-owned position post-cooldown.
     * @dev Caller (PoolManager) verifies cooldown & contributor authorization.
     *      Penalty distributed by library; refund returned to PoolManager for
     *      pro-rata distribution.
     */
    function processPoolStaleExit(uint256 opinionId)
        external
        nonReentrant
        whenNotPaused
        onlyPoolManager
        returns (uint96 refundToPool)
    {
        if (!selfExitEnabled) revert FeatureDisabled();
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        address king = opinion.currentAnswerOwner;
        if (!hasRole(POOL_MANAGER_ROLE, king)) revert SoloMustUseSoloExit();

        refundToPool = SelfExitLib.processPoolExit(
            opinions,
            lockedStake,
            usdcToken,
            feeManager,
            opinionId,
            king,
            msg.sender,
            _exitConfig()
        );
    }

    /// @dev Builds the config struct used by SelfExitLib functions.
    function _exitConfig() private view returns (SelfExitLib.ExitConfig memory) {
        return SelfExitLib.ExitConfig({
            exitPenaltyBps: exitPenaltyBps,
            penaltyCreatorShareBps: penaltyCreatorShareBps,
            reclaimDiscountBps: reclaimDiscountBps,
            minReclaimPrice: minReclaimPrice
        });
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── QUESTION TRADING (UNCHANGED FROM V3) ───────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function listQuestionForSale(uint256 opinionId, uint256 price) external nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, msg.sender, address(0), price);
    }

    function buyQuestion(uint256 opinionId) external nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();

        uint96 salePrice = opinion.salePrice;
        if (salePrice == 0) revert NotForSale(opinionId);

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < salePrice) revert InsufficientAllowance(salePrice, allowance);

        address currentOwner = opinion.questionOwner;
        uint96 platformFee = uint96((salePrice * 10) / 100);
        uint96 sellerAmount = salePrice - platformFee;

        opinion.questionOwner = msg.sender;
        opinion.salePrice = 0;

        usdcToken.safeTransferFrom(msg.sender, address(this), salePrice);
        feeManager.accumulateFee(currentOwner, sellerAmount);

        emit QuestionSaleAction(opinionId, 1, currentOwner, msg.sender, salePrice);
    }

    function cancelQuestionSale(uint256 opinionId) external nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, msg.sender, address(0), 0);
    }

    function transferQuestionOwnership(uint256 opinionId, address newOwner) external nonReentrant whenNotPaused {
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        address previousOwner = opinion.questionOwner;
        opinion.questionOwner = newOwner;
        opinion.salePrice = 0;

        emit QuestionOwnershipTransferred(opinionId, previousOwner, newOwner);
    }

    function transferAnswerOwnership(uint256 opinionId, address newOwner) external nonReentrant whenNotPaused {
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.currentAnswerOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.currentAnswerOwner);

        address previousOwner = opinion.currentAnswerOwner;
        opinion.currentAnswerOwner = newOwner;

        emit AnswerOwnershipTransferred(opinionId, previousOwner, newOwner, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── POOL INTEGRATION ───────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external onlyPoolManager {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: "",
                owner: poolAddress,
                price: uint96(price),
                timestamp: uint32(block.timestamp)
            })
        );

        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = "";
        opinion.currentAnswerOwner = poolAddress;
        opinion.lastPrice = uint96(price);
        opinion.totalVolume += uint96(price);
        opinion.nextPrice = uint96(_calculateNextPriceDynamic(opinionId, price));

        // V4: track timestamp; lockedStake carries forward unchanged.
        lastTradeTimestamp[opinionId] = uint32(block.timestamp);

        emit OpinionAction(opinionId, 1, answer, address(poolManager), price);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── VIEW FUNCTIONS ─────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function getAnswerHistory(uint256 opinionId) external view returns (OpinionStructs.AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId];
    }

    function getNextPrice(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        if (opinion.nextPrice == 0) {
            return _estimateNextPriceView(opinion.lastPrice);
        }
        return opinion.nextPrice;
    }

    function getOpinionDetails(uint256 opinionId) external view returns (OpinionStructs.Opinion memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId];
    }

    function getTradeCount(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId].length;
    }

    function getCreatorGain(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].totalVolume;
    }

    function isPoolOwned(uint256 opinionId) external view returns (bool) {
        if (opinionId >= nextOpinionId) return false;
        return hasRole(POOL_MANAGER_ROLE, opinions[opinionId].currentAnswerOwner);
    }

    // getPriceNonce / getPriceMetadata removed (debug-only views; the values
    // are accessible by tools that read storage slots directly).

    // V4 view helpers removed to save bytecode. The public mappings
    // `lockedStake(uint256)` and `lastTradeTimestamp(uint256)` plus
    // `selfExitEnabled()`, `soloCooldown()`, and `paused()` provide the
    // raw data the frontend needs. Convenience predicates ("isLegacy",
    // "canSelfExit", countdown) are computed off-chain.

    // ─── Internal interface (for linked contracts) ──────────────────────

    function validateOpinionExists(uint256 opinionId) external view onlyLinkedContracts returns (bool) {
        return opinionId < nextOpinionId && opinions[opinionId].creator != address(0);
    }

    function getNextOpinionId() external view onlyLinkedContracts returns (uint256) {
        return nextOpinionId;
    }

    function updateCoreParameter(uint8 paramType, uint256 value) external onlyLinkedContracts {
        if (paramType == 0) minimumPrice = uint96(value);
        else if (paramType == 1) questionCreationFee = uint96(value);
        else if (paramType == 2) initialAnswerPrice = uint96(value);
        else if (paramType == 3) absoluteMaxPriceChange = value;
        else if (paramType == 4) maxTradesPerBlock = value;
        else if (paramType == 5) maxInitialPrice = uint96(value);

        emit ParameterUpdated(paramType, value);
    }

    function updateCoreParameterAddress(uint8 paramType, address value) external onlyLinkedContracts {
        if (paramType == 0) feeManager = IFeeManager(value);
        else if (paramType == 1) poolManager = IPoolManager(value);
        else if (paramType == 2) monitoringManager = IMonitoringManager(value);
        else if (paramType == 3) securityManager = ISecurityManager(value);
    }

    function getOpinionOwner(uint256 opinionId) external view onlyLinkedContracts returns (address) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].questionOwner;
    }

    function getOpinionCreator(uint256 opinionId) external view onlyLinkedContracts returns (address) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].creator;
    }

    function isOpinionActive(uint256 opinionId) external view onlyLinkedContracts returns (bool) {
        if (opinionId >= nextOpinionId) return false;
        return opinions[opinionId].isActive;
    }

    function isPaused() external view returns (bool) {
        return paused();
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── INTERNAL FUNCTIONS ─────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function _basicValidation(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal view {
        require(extensionsContract.validateCategories(opinionCategories), "Invalid categories");
        ValidationLibrary.validateOpinionParams(question, answer, MAX_QUESTION_LENGTH, MAX_ANSWER_LENGTH);
        ValidationLibrary.validateDescription(description);

        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > maxInitialPrice) {
            revert InvalidInitialPrice();
        }
    }

    function _createOpinionRecord(
        string calldata question,
        string calldata answer,
        string calldata description,
        string calldata link,
        uint96 initialPrice
    ) internal returns (uint256 opinionId) {
        opinionId = nextOpinionId++;

        OpinionStructs.Opinion storage newOpinion = opinions[opinionId];
        newOpinion.question = question;
        newOpinion.creator = msg.sender;
        newOpinion.questionOwner = msg.sender;
        newOpinion.isActive = true;

        newOpinion.currentAnswer = answer;
        newOpinion.currentAnswerDescription = description;
        newOpinion.currentAnswerOwner = msg.sender;
        newOpinion.ipfsHash = "";
        newOpinion.link = link;
        newOpinion.lastPrice = initialPrice;
        newOpinion.nextPrice = uint96(_estimateNextPriceView(initialPrice));

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: msg.sender,
                price: initialPrice,
                timestamp: uint32(block.timestamp)
            })
        );

        return opinionId;
    }

    function _updateOpinionState(
        OpinionStructs.Opinion storage opinion,
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link,
        uint96 price,
        address newOwner
    ) internal {
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = newOwner;
        opinion.link = link;
        opinion.lastPrice = price;
        opinion.totalVolume += price;
        opinion.nextPrice = uint96(_calculateNextPriceDynamic(opinionId, price));

        emit PriceCalculated(opinionId, price, opinion.nextPrice, nonce);
    }

    function _calculateNextPriceDynamic(uint256 opinionId, uint256 currentPrice) internal returns (uint256) {
        nonce++;
        return PriceCalculator.calculateNextPrice(
            opinionId,
            currentPrice,
            minimumPrice,
            absoluteMaxPriceChange,
            nonce,
            priceMetadata,
            priceHistory
        );
    }

    /// @dev View-only estimation. The real next price is set in `_calculateNextPriceDynamic`
    ///      after each trade — this is just a display fallback for UIs that need a value
    ///      before the first trade. Returns `currentPrice * 1.15` capped at price limits.
    function _estimateNextPriceView(uint96 currentPrice) internal view returns (uint256) {
        uint256 baseIncrease = (uint256(currentPrice) * 115) / 100;
        uint256 maxAllowed = currentPrice + (uint256(currentPrice) * absoluteMaxPriceChange / 100);
        if (baseIncrease > maxAllowed) return maxAllowed;
        if (baseIncrease < minimumPrice) return minimumPrice;
        return baseIncrease;
    }

    function _updatePriceMetadata(uint256 opinionId, uint256 newPrice) internal {
        uint256 metadata = priceMetadata[opinionId];
        uint8 tradeCount = uint8(metadata);
        if (tradeCount < 255) tradeCount++;
        metadata = uint256(tradeCount) | (block.timestamp << 8);
        priceMetadata[opinionId] = metadata;

        uint256 history = priceHistory[opinionId];
        history = (history << 80);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    function _checkAndUpdateTradesInBlock() internal {
        if (maxTradesPerBlock == 0) return;
        if (userLastBlock[msg.sender] != block.number) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = block.number;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > maxTradesPerBlock) {
                revert MaxTradesPerBlockExceeded(userTradesInBlock[msg.sender], maxTradesPerBlock);
            }
        }
    }

    function _checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number) revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── V4 ADMIN SETTERS (bounded, role-gated, dispatched) ────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Update a self-exit parameter. Each branch enforces its own bounds.
     * @dev paramType encoding:
     *      0 = soloCooldown            (bounded by MIN/MAX_COOLDOWN)
     *      1 = poolCooldown            (bounded by MIN/MAX_COOLDOWN)
     *      2 = poolExtendedCooldown    (must be >= poolCooldown, ≤ MAX_COOLDOWN)
     *      3 = exitPenaltyBps          (5%–50%)
     *      4 = penaltyCreatorShareBps  (≤ 100%)
     *      5 = reclaimDiscountBps      (10%–90%)
     *      6 = largeHolderThresholdBps (1bps–50%)
     *      7 = minReclaimPrice         (>0)
     *      8 = spamFee                 (≤ 100 USDC)
     */
    function setSelfExitParameter(uint8 paramType, uint256 newValue) external onlyRole(ADMIN_ROLE) {
        if (paramType == 0) {
            if (newValue < MIN_COOLDOWN || newValue > MAX_COOLDOWN) revert InvalidParameterValue();
            soloCooldown = uint32(newValue);
        } else if (paramType == 1) {
            if (newValue < MIN_COOLDOWN || newValue > MAX_COOLDOWN) revert InvalidParameterValue();
            poolCooldown = uint32(newValue);
        } else if (paramType == 2) {
            if (newValue > MAX_COOLDOWN || newValue < poolCooldown) revert InvalidParameterValue();
            poolExtendedCooldown = uint32(newValue);
        } else if (paramType == 3) {
            if (newValue < MIN_EXIT_PENALTY_BPS || newValue > MAX_EXIT_PENALTY_BPS) revert InvalidParameterValue();
            exitPenaltyBps = uint16(newValue);
        } else if (paramType == 4) {
            if (newValue > BPS_DENOMINATOR) revert InvalidParameterValue();
            penaltyCreatorShareBps = uint16(newValue);
        } else if (paramType == 5) {
            if (newValue < MIN_RECLAIM_DISCOUNT_BPS || newValue > MAX_RECLAIM_DISCOUNT_BPS) revert InvalidParameterValue();
            reclaimDiscountBps = uint16(newValue);
        } else if (paramType == 6) {
            if (newValue == 0 || newValue > MAX_LARGE_HOLDER_THRESHOLD_BPS) revert InvalidParameterValue();
            largeHolderThresholdBps = uint16(newValue);
        } else if (paramType == 7) {
            if (newValue == 0) revert InvalidParameterValue();
            minReclaimPrice = uint96(newValue);
        } else if (paramType == 8) {
            if (newValue > 100_000_000) revert InvalidParameterValue();
            spamFee = uint96(newValue);
        } else {
            revert InvalidParameterValue();
        }
        emit SelfExitParameterUpdated(paramType, newValue);
    }

    /// @notice Toggle V4 features. flagType 0=selfExit, 1=reclaim.
    function setSelfExitFlag(uint8 flagType, bool enabled) external onlyRole(ADMIN_ROLE) {
        if (flagType == 0) selfExitEnabled = enabled;
        else if (flagType == 1) reclaimVacantSlotEnabled = enabled;
        else revert InvalidParameterValue();
        emit SelfExitFlagToggled(flagType, enabled);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── V2/V3 ADMIN FUNCTIONS (preserved) ─────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency withdrawal. Restricted to ADMIN_ROLE and ONLY when paused.
     *      In V4 this CAN drain locked stakes — use only in catastrophic recovery.
     */
    function emergencyWithdraw(address token, address to, uint256 amount)
        external
        nonReentrant
        whenPaused
        onlyRole(ADMIN_ROLE)
    {
        require(to != address(0), "Zero address");
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
        emit EmergencyWithdrawal(token, to, amount, block.timestamp);
    }

    // V3's `rescueStuckFees()` is REMOVED in V4: it would drain locked stakes.
    // Use `emergencyWithdraw` (whenPaused, ADMIN_ROLE) for explicit recovery.

    // ════════════════════════════════════════════════════════════════════
    // ─── UUPS UPGRADE AUTHORIZATION ────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // ════════════════════════════════════════════════════════════════════
    // ─── ADMIN TRANSFER ────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════
    function transferFullAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid address");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _grantRole(ADMIN_ROLE, newAdmin);
        _grantRole(MODERATOR_ROLE, newAdmin);
        _revokeRole(MODERATOR_ROLE, msg.sender);
        _revokeRole(ADMIN_ROLE, msg.sender);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
