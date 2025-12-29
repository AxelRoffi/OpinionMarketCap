// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./interfaces/IOpinionExtensionsInternal.sol";
import "./interfaces/IOpinionCoreInternal.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionExtensions
 * @dev Extension slots and categories management - Size optimized (~8KB)
 */
contract OpinionExtensions is
    Initializable,
    AccessControlUpgradeable,
    IOpinionExtensionsInternal,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CORE_CONTRACT_ROLE = keccak256("CORE_CONTRACT_ROLE");

    // --- CONSTANTS ---
    uint256 public constant MAX_CATEGORIES_PER_OPINION = 3;

    // --- STATE VARIABLES ---
    IOpinionCoreInternal public coreContract;
    
    // Categories storage
    string[] public categories;
    mapping(uint256 => string[]) public opinionCategories;

    // Extension slots storage
    mapping(uint256 => mapping(string => string)) public opinionStringExtensions;
    mapping(uint256 => mapping(string => uint256)) public opinionNumberExtensions;
    mapping(uint256 => mapping(string => bool)) public opinionBoolExtensions;
    mapping(uint256 => mapping(string => address)) public opinionAddressExtensions;
    mapping(uint256 => string[]) public opinionExtensionKeys;

    // --- MODIFIERS ---
    modifier onlyCoreContract() {
        if (!hasRole(CORE_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, CORE_CONTRACT_ROLE);
        _;
    }

    modifier validOpinion(uint256 opinionId) {
        require(coreContract.validateOpinionExists(opinionId), "Opinion not found");
        _;
    }

    // --- INITIALIZATION ---
    function initialize(
        address _coreContract,
        address _admin
    ) public initializer {
        __AccessControl_init();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(CORE_CONTRACT_ROLE, _coreContract);

        coreContract = IOpinionCoreInternal(_coreContract);

        // Initialize default categories
        categories = [
            "Technology", "AI & Robotics", "Crypto & Web3", "DeFi (Decentralized Finance)", 
            "Science", "Environment & Climate", "Business & Finance", "Real Estate", 
            "Politics", "Law & Legal", "News", "Sports", "Automotive", "Gaming", 
            "Movies", "TV Shows", "Music", "Podcasts", "Literature", "Art & Design", 
            "Photography", "Celebrities & Pop Culture", "Social Media", "Humor & Memes", 
            "Fashion", "Beauty & Skincare", "Health & Fitness", "Food & Drink", "Travel", 
            "History", "Philosophy", "Spirituality & Religion", "Education", 
            "Career & Workplace", "Relationships", "Parenting & Family", "Pets & Animals", 
            "DIY & Home Improvement", "True Crime", "Adult (NSFW)"
        ];
    }

    // --- EXTENSION SLOTS FUNCTIONS ---

    function setOpinionStringExtension(
        uint256 opinionId, 
        string calldata key, 
        string calldata value
    ) external validOpinion(opinionId) {
        require(coreContract.getOpinionCreator(opinionId) == msg.sender, "Not opinion creator");
        
        if (!_hasExtensionKey(opinionId, key)) {
            opinionExtensionKeys[opinionId].push(key);
        }
        
        opinionStringExtensions[opinionId][key] = value;
        emit OpinionStringExtensionSet(opinionId, key, value);
    }

    function setOpinionNumberExtension(
        uint256 opinionId, 
        string calldata key, 
        uint256 value
    ) external validOpinion(opinionId) {
        require(coreContract.getOpinionCreator(opinionId) == msg.sender, "Not opinion creator");
        
        if (!_hasExtensionKey(opinionId, key)) {
            opinionExtensionKeys[opinionId].push(key);
        }
        
        opinionNumberExtensions[opinionId][key] = value;
        emit OpinionNumberExtensionSet(opinionId, key, value);
    }

    function setOpinionBoolExtension(
        uint256 opinionId, 
        string calldata key, 
        bool value
    ) external validOpinion(opinionId) {
        require(coreContract.getOpinionCreator(opinionId) == msg.sender, "Not opinion creator");
        
        if (!_hasExtensionKey(opinionId, key)) {
            opinionExtensionKeys[opinionId].push(key);
        }
        
        opinionBoolExtensions[opinionId][key] = value;
        emit OpinionBoolExtensionSet(opinionId, key, value);
    }

    function setOpinionAddressExtension(
        uint256 opinionId, 
        string calldata key, 
        address value
    ) external validOpinion(opinionId) {
        require(coreContract.getOpinionCreator(opinionId) == msg.sender, "Not opinion creator");
        
        if (!_hasExtensionKey(opinionId, key)) {
            opinionExtensionKeys[opinionId].push(key);
        }
        
        opinionAddressExtensions[opinionId][key] = value;
        emit OpinionAddressExtensionSet(opinionId, key, value);
    }

    function getOpinionExtensions(uint256 opinionId) external view validOpinion(opinionId) returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
        keys = opinionExtensionKeys[opinionId];
        stringValues = new string[](keys.length);
        numberValues = new uint256[](keys.length);
        boolValues = new bool[](keys.length);
        addressValues = new address[](keys.length);

        for (uint256 i = 0; i < keys.length; i++) {
            stringValues[i] = opinionStringExtensions[opinionId][keys[i]];
            numberValues[i] = opinionNumberExtensions[opinionId][keys[i]];
            boolValues[i] = opinionBoolExtensions[opinionId][keys[i]];
            addressValues[i] = opinionAddressExtensions[opinionId][keys[i]];
        }
    }

    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view validOpinion(opinionId) returns (string memory) {
        return opinionStringExtensions[opinionId][key];
    }

    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view validOpinion(opinionId) returns (uint256) {
        return opinionNumberExtensions[opinionId][key];
    }

    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view validOpinion(opinionId) returns (bool) {
        return opinionBoolExtensions[opinionId][key];
    }

    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view validOpinion(opinionId) returns (address) {
        return opinionAddressExtensions[opinionId][key];
    }

    function hasOpinionExtension(uint256 opinionId, string calldata key) external view validOpinion(opinionId) returns (bool) {
        return _hasExtensionKey(opinionId, key);
    }

    function getOpinionExtensionCount(uint256 opinionId) external view validOpinion(opinionId) returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }

    // --- CATEGORIES FUNCTIONS ---

    function addCategoryToCategories(string calldata newCategory) external onlyRole(ADMIN_ROLE) {
        // Check for duplicates
        for (uint256 i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(newCategory))) {
                revert("Category already exists");
            }
        }
        
        categories.push(newCategory);
        emit CategoryAction(0, categories.length - 1, newCategory, msg.sender, 0);
    }

    function getAvailableCategories() external view returns (string[] memory) {
        return categories;
    }

    function getOpinionCategories(uint256 opinionId) external view validOpinion(opinionId) returns (string[] memory) {
        return opinionCategories[opinionId];
    }

    function getCategoryCount() external view returns (uint256) {
        return categories.length;
    }

    // --- INTERNAL INTERFACE IMPLEMENTATION ---

    function validateExtensionAccess(uint256 opinionId, address caller) external view onlyCoreContract returns (bool) {
        if (!coreContract.validateOpinionExists(opinionId)) return false;
        return coreContract.getOpinionCreator(opinionId) == caller;
    }

    function initializeOpinionCategories(uint256 opinionId, string[] memory _categories) external onlyCoreContract {
        require(_categories.length <= MAX_CATEGORIES_PER_OPINION, "Too many categories");
        
        // Validate each category exists
        for (uint256 i = 0; i < _categories.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < categories.length; j++) {
                if (keccak256(bytes(categories[j])) == keccak256(bytes(_categories[i]))) {
                    found = true;
                    break;
                }
            }
            require(found, "Invalid category");
        }
        
        opinionCategories[opinionId] = _categories;
    }

    function validateCategories(string[] memory _categories) external view onlyCoreContract returns (bool) {
        if (_categories.length > MAX_CATEGORIES_PER_OPINION) return false;
        
        for (uint256 i = 0; i < _categories.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < categories.length; j++) {
                if (keccak256(bytes(categories[j])) == keccak256(bytes(_categories[i]))) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        
        return true;
    }

    function getCategoriesCount() external view onlyCoreContract returns (uint256) {
        return categories.length;
    }

    // --- INTERNAL FUNCTIONS ---

    function _hasExtensionKey(uint256 opinionId, string calldata key) internal view returns (bool) {
        string[] storage keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));
        
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return true;
            }
        }
        return false;
    }
}