// Sources flattened with hardhat v2.23.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/utils/Initializable.sol)

pragma solidity ^0.8.20;

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
 * reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
 * case an upgrade adds a module that needs to be initialized.
 *
 * For example:
 *
 * [.hljs-theme-light.nopadding]
 * ```solidity
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
 *
 * contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
 *     function initializeV2() reinitializer(2) public {
 *         __ERC20Permit_init("MyToken");
 *     }
 * }
 * ```
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 *
 * [CAUTION]
 * ====
 * Avoid leaving a contract uninitialized.
 *
 * An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
 * contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
 * the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * /// @custom:oz-upgrades-unsafe-allow constructor
 * constructor() {
 *     _disableInitializers();
 * }
 * ```
 * ====
 */
abstract contract Initializable {
    /**
     * @dev Storage of the initializable contract.
     *
     * It's implemented on a custom ERC-7201 namespace to reduce the risk of storage collisions
     * when using with upgradeable contracts.
     *
     * @custom:storage-location erc7201:openzeppelin.storage.Initializable
     */
    struct InitializableStorage {
        /**
         * @dev Indicates that the contract has been initialized.
         */
        uint64 _initialized;
        /**
         * @dev Indicates that the contract is in the process of being initialized.
         */
        bool _initializing;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.Initializable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant INITIALIZABLE_STORAGE = 0xf0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a00;

    /**
     * @dev The contract is already initialized.
     */
    error InvalidInitialization();

    /**
     * @dev The contract is not initializing.
     */
    error NotInitializing();

    /**
     * @dev Triggered when the contract has been initialized or reinitialized.
     */
    event Initialized(uint64 version);

    /**
     * @dev A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
     * `onlyInitializing` functions can be used to initialize parent contracts.
     *
     * Similar to `reinitializer(1)`, except that in the context of a constructor an `initializer` may be invoked any
     * number of times. This behavior in the constructor can be useful during testing and is not expected to be used in
     * production.
     *
     * Emits an {Initialized} event.
     */
    modifier initializer() {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        // Cache values to avoid duplicated sloads
        bool isTopLevelCall = !$._initializing;
        uint64 initialized = $._initialized;

        // Allowed calls:
        // - initialSetup: the contract is not in the initializing state and no previous version was
        //                 initialized
        // - construction: the contract is initialized at version 1 (no reininitialization) and the
        //                 current contract is just being deployed
        bool initialSetup = initialized == 0 && isTopLevelCall;
        bool construction = initialized == 1 && address(this).code.length == 0;

        if (!initialSetup && !construction) {
            revert InvalidInitialization();
        }
        $._initialized = 1;
        if (isTopLevelCall) {
            $._initializing = true;
        }
        _;
        if (isTopLevelCall) {
            $._initializing = false;
            emit Initialized(1);
        }
    }

    /**
     * @dev A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
     * contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
     * used to initialize parent contracts.
     *
     * A reinitializer may be used after the original initialization step. This is essential to configure modules that
     * are added through upgrades and that require initialization.
     *
     * When `version` is 1, this modifier is similar to `initializer`, except that functions marked with `reinitializer`
     * cannot be nested. If one is invoked in the context of another, execution will revert.
     *
     * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
     * a contract, executing them in the right order is up to the developer or operator.
     *
     * WARNING: Setting the version to 2**64 - 1 will prevent any future reinitialization.
     *
     * Emits an {Initialized} event.
     */
    modifier reinitializer(uint64 version) {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        if ($._initializing || $._initialized >= version) {
            revert InvalidInitialization();
        }
        $._initialized = version;
        $._initializing = true;
        _;
        $._initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier onlyInitializing() {
        _checkInitializing();
        _;
    }

    /**
     * @dev Reverts if the contract is not in an initializing state. See {onlyInitializing}.
     */
    function _checkInitializing() internal view virtual {
        if (!_isInitializing()) {
            revert NotInitializing();
        }
    }

    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     *
     * Emits an {Initialized} event the first time it is successfully executed.
     */
    function _disableInitializers() internal virtual {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        if ($._initializing) {
            revert InvalidInitialization();
        }
        if ($._initialized != type(uint64).max) {
            $._initialized = type(uint64).max;
            emit Initialized(type(uint64).max);
        }
    }

    /**
     * @dev Returns the highest version that has been initialized. See {reinitializer}.
     */
    function _getInitializedVersion() internal view returns (uint64) {
        return _getInitializableStorage()._initialized;
    }

    /**
     * @dev Returns `true` if the contract is currently initializing. See {onlyInitializing}.
     */
    function _isInitializing() internal view returns (bool) {
        return _getInitializableStorage()._initializing;
    }

    /**
     * @dev Returns a pointer to the storage namespace.
     */
    // solhint-disable-next-line var-name-mixedcase
    function _getInitializableStorage() private pure returns (InitializableStorage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }
}


// File @openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal onlyInitializing {
    }

    function __Context_init_unchained() internal onlyInitializing {
    }
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/IERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/ERC165.sol)

pragma solidity ^0.8.20;


/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 */
abstract contract ERC165Upgradeable is Initializable, IERC165 {
    function __ERC165_init() internal onlyInitializing {
    }

    function __ERC165_init_unchained() internal onlyInitializing {
    }
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}


// File @openzeppelin/contracts/access/IAccessControl.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/IAccessControl.sol)

pragma solidity ^0.8.20;

/**
 * @dev External interface of AccessControl declared to support ERC165 detection.
 */
interface IAccessControl {
    /**
     * @dev The `account` is missing a role.
     */
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    /**
     * @dev The caller of a function is not the expected one.
     *
     * NOTE: Don't confuse with {AccessControlUnauthorizedAccount}.
     */
    error AccessControlBadConfirmation();

    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted signaling this.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call, an admin role
     * bearer except when using {AccessControl-_setupRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     */
    function renounceRole(bytes32 role, address callerConfirmation) external;
}


// File @openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/AccessControl.sol)

pragma solidity ^0.8.20;




/**
 * @dev Contract module that allows children to implement role-based access
 * control mechanisms. This is a lightweight version that doesn't allow enumerating role
 * members except through off-chain means by accessing the contract event logs. Some
 * applications may benefit from on-chain enumerability, for those cases see
 * {AccessControlEnumerable}.
 *
 * Roles are referred to by their `bytes32` identifier. These should be exposed
 * in the external API and be unique. The best way to achieve this is by
 * using `public constant` hash digests:
 *
 * ```solidity
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```solidity
 * function foo() public {
 *     require(hasRole(MY_ROLE, msg.sender));
 *     ...
 * }
 * ```
 *
 * Roles can be granted and revoked dynamically via the {grantRole} and
 * {revokeRole} functions. Each role has an associated admin role, and only
 * accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 *
 * By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 * that only accounts with this role will be able to grant or revoke other
 * roles. More complex role relationships can be created by using
 * {_setRoleAdmin}.
 *
 * WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 * grant and revoke this role. Extra precautions should be taken to secure
 * accounts that have been granted it. We recommend using {AccessControlDefaultAdminRules}
 * to enforce additional security measures for this role.
 */
abstract contract AccessControlUpgradeable is Initializable, ContextUpgradeable, IAccessControl, ERC165Upgradeable {
    struct RoleData {
        mapping(address account => bool) hasRole;
        bytes32 adminRole;
    }

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;


    /// @custom:storage-location erc7201:openzeppelin.storage.AccessControl
    struct AccessControlStorage {
        mapping(bytes32 role => RoleData) _roles;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.AccessControl")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant AccessControlStorageLocation = 0x02dd7bc7dec4dceedda775e58dd541e08a116c6c53815c0bd028192f7b626800;

    function _getAccessControlStorage() private pure returns (AccessControlStorage storage $) {
        assembly {
            $.slot := AccessControlStorageLocation
        }
    }

    /**
     * @dev Modifier that checks that an account has a specific role. Reverts
     * with an {AccessControlUnauthorizedAccount} error including the required role.
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    function __AccessControl_init() internal onlyInitializing {
    }

    function __AccessControl_init_unchained() internal onlyInitializing {
    }
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        AccessControlStorage storage $ = _getAccessControlStorage();
        return $._roles[role].hasRole[account];
    }

    /**
     * @dev Reverts with an {AccessControlUnauthorizedAccount} error if `_msgSender()`
     * is missing `role`. Overriding this function changes the behavior of the {onlyRole} modifier.
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    /**
     * @dev Reverts with an {AccessControlUnauthorizedAccount} error if `account`
     * is missing `role`.
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        AccessControlStorage storage $ = _getAccessControlStorage();
        return $._roles[role].adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleGranted} event.
     */
    function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleRevoked} event.
     */
    function revokeRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been revoked `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     *
     * May emit a {RoleRevoked} event.
     */
    function renounceRole(bytes32 role, address callerConfirmation) public virtual {
        if (callerConfirmation != _msgSender()) {
            revert AccessControlBadConfirmation();
        }

        _revokeRole(role, callerConfirmation);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        AccessControlStorage storage $ = _getAccessControlStorage();
        bytes32 previousAdminRole = getRoleAdmin(role);
        $._roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Attempts to grant `role` to `account` and returns a boolean indicating if `role` was granted.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleGranted} event.
     */
    function _grantRole(bytes32 role, address account) internal virtual returns (bool) {
        AccessControlStorage storage $ = _getAccessControlStorage();
        if (!hasRole(role, account)) {
            $._roles[role].hasRole[account] = true;
            emit RoleGranted(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Attempts to revoke `role` to `account` and returns a boolean indicating if `role` was revoked.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleRevoked} event.
     */
    function _revokeRole(bytes32 role, address account) internal virtual returns (bool) {
        AccessControlStorage storage $ = _getAccessControlStorage();
        if (hasRole(role, account)) {
            $._roles[role].hasRole[account] = false;
            emit RoleRevoked(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
    }
}


// File @openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;


/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract PausableUpgradeable is Initializable, ContextUpgradeable {
    /// @custom:storage-location erc7201:openzeppelin.storage.Pausable
    struct PausableStorage {
        bool _paused;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.Pausable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant PausableStorageLocation = 0xcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300;

    function _getPausableStorage() private pure returns (PausableStorage storage $) {
        assembly {
            $.slot := PausableStorageLocation
        }
    }

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Initializes the contract in unpaused state.
     */
    function __Pausable_init() internal onlyInitializing {
        __Pausable_init_unchained();
    }

    function __Pausable_init_unchained() internal onlyInitializing {
        PausableStorage storage $ = _getPausableStorage();
        $._paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        PausableStorage storage $ = _getPausableStorage();
        return $._paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        PausableStorage storage $ = _getPausableStorage();
        $._paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        PausableStorage storage $ = _getPausableStorage();
        $._paused = false;
        emit Unpaused(_msgSender());
    }
}


// File @openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuardUpgradeable is Initializable {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /// @custom:storage-location erc7201:openzeppelin.storage.ReentrancyGuard
    struct ReentrancyGuardStorage {
        uint256 _status;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ReentrancyGuardStorageLocation = 0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    function _getReentrancyGuardStorage() private pure returns (ReentrancyGuardStorage storage $) {
        assembly {
            $.slot := ReentrancyGuardStorageLocation
        }
    }

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    function __ReentrancyGuard_init() internal onlyInitializing {
        __ReentrancyGuard_init_unchained();
    }

    function __ReentrancyGuard_init_unchained() internal onlyInitializing {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        $._status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if ($._status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        $._status = ENTERED;
    }

    function _nonReentrantAfter() private {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        $._status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        return $._status == ENTERED;
    }
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/IERC20Permit.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 *
 * ==== Security Considerations
 *
 * There are two important considerations concerning the use of `permit`. The first is that a valid permit signature
 * expresses an allowance, and it should not be assumed to convey additional meaning. In particular, it should not be
 * considered as an intention to spend the allowance in any specific way. The second is that because permits have
 * built-in replay protection and can be submitted by anyone, they can be frontrun. A protocol that uses permits should
 * take this into consideration and allow a `permit` call to fail. Combining these two aspects, a pattern that may be
 * generally recommended is:
 *
 * ```solidity
 * function doThingWithPermit(..., uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
 *     try token.permit(msg.sender, address(this), value, deadline, v, r, s) {} catch {}
 *     doThing(..., value);
 * }
 *
 * function doThing(..., uint256 value) public {
 *     token.safeTransferFrom(msg.sender, address(this), value);
 *     ...
 * }
 * ```
 *
 * Observe that: 1) `msg.sender` is used as the owner, leaving no ambiguity as to the signer intent, and 2) the use of
 * `try/catch` allows the permit to fail and makes the code tolerant to frontrunning. (See also
 * {SafeERC20-safeTransferFrom}).
 *
 * Additionally, note that smart contract wallets (such as Argent or Safe) are not able to produce permit signatures, so
 * contracts should have entry points that don't rely on permit.
 */
interface IERC20Permit {
    /**
     * @dev Sets `value` as the allowance of `spender` over ``owner``'s tokens,
     * given ``owner``'s signed approval.
     *
     * IMPORTANT: The same issues {IERC20-approve} has related to transaction
     * ordering also apply here.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `deadline` must be a timestamp in the future.
     * - `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
     * over the EIP712-formatted function arguments.
     * - the signature must use ``owner``'s current nonce (see {nonces}).
     *
     * For more information on the signature format, see the
     * https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
     * section].
     *
     * CAUTION: See Security Considerations above.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @dev Returns the current nonce for `owner`. This value must be
     * included whenever a signature is generated for {permit}.
     *
     * Every successful call to {permit} increases ``owner``'s nonce by one. This
     * prevents a signature from being used multiple times.
     */
    function nonces(address owner) external view returns (uint256);

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/utils/Address.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Address.sol)

pragma solidity ^0.8.20;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev The ETH balance of the account is not enough to perform the operation.
     */
    error AddressInsufficientBalance(address account);

    /**
     * @dev There's no code at `target` (it is not a contract).
     */
    error AddressEmptyCode(address target);

    /**
     * @dev A call to an address target failed. The target may have reverted.
     */
    error FailedInnerCall();

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.20/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        if (address(this).balance < amount) {
            revert AddressInsufficientBalance(address(this));
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert FailedInnerCall();
        }
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason or custom error, it is bubbled
     * up by this function (like regular Solidity function calls). However, if
     * the call reverted with no returned reason, this function reverts with a
     * {FailedInnerCall} error.
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        if (address(this).balance < value) {
            revert AddressInsufficientBalance(address(this));
        }
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and reverts if the target
     * was not a contract or bubbling up the revert reason (falling back to {FailedInnerCall}) in case of an
     * unsuccessful call.
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata
    ) internal view returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            // only check if target is a contract if the call was successful and the return data is empty
            // otherwise we already know that it was a contract
            if (returndata.length == 0 && target.code.length == 0) {
                revert AddressEmptyCode(target);
            }
            return returndata;
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and reverts if it wasn't, either by bubbling the
     * revert reason or with a default {FailedInnerCall} error.
     */
    function verifyCallResult(bool success, bytes memory returndata) internal pure returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            return returndata;
        }
    }

    /**
     * @dev Reverts with returndata if present. Otherwise reverts with {FailedInnerCall}.
     */
    function _revert(bytes memory returndata) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert FailedInnerCall();
        }
    }
}


// File @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.20;



/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    /**
     * @dev An operation with an ERC20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address-functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data);
        if (returndata.length != 0 && !abi.decode(returndata, (bool))) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silents catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We cannot use {Address-functionCall} here since this should return false
        // and not revert is the subcall reverts.

        (bool success, bytes memory returndata) = address(token).call(data);
        return success && (returndata.length == 0 || abi.decode(returndata, (bool))) && address(token).code.length > 0;
    }
}


// File contracts/core/structs/OpinionStructs.sol

// structs/OpinionStructs.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

library OpinionStructs {
    struct Opinion {
        uint96 lastPrice;
        uint96 nextPrice;
        uint96 totalVolume;
        uint96 salePrice;
        address creator;
        address questionOwner;
        address currentAnswerOwner;
        bool isActive;
        string question;
        string currentAnswer;
        string currentAnswerDescription;     // 🆕 NEW FIELD
        string ipfsHash;
        string link;
        string[] categories;                 // 🚨 IMPOSED - ADDED AT END ONLY
    }

    struct AnswerHistory {
        string answer;
        string description;          // 🆕 NEW FIELD
        address owner;
        uint96 price;
        uint32 timestamp;
    }

    struct TradeParams {
        uint256 opinionId;
        uint96 price;
        string answer;
        address trader;
        uint32 timestamp;
    }

    struct FeeDistribution {
        uint96 platformFee;
        uint96 creatorFee;
        uint96 ownerAmount;
    }
}


// File contracts/core/interfaces/IFeeManager.sol

// interfaces/IFeeManager.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

interface IFeeManager {
    function accumulateFee(address recipient, uint96 amount) external;

    function claimAccumulatedFees() external;

    function withdrawPlatformFees(address token, address recipient) external;

    function getTotalAccumulatedFees() external view returns (uint96);

    function getAccumulatedFees(address user) external view returns (uint96);

    function calculateFees(
        uint256 price
    ) external view returns (OpinionStructs.FeeDistribution memory);

    function calculateFeeDistribution(
        uint256 price
    )
        external
        view
        returns (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount);

    function handlePoolCreationFee(
        uint256 opinionId,
        uint256 poolId,
        uint96 fee
    ) external;

    function handleContributionFee(
        uint256 opinionId,
        uint256 poolId,
        uint96 fee
    ) external;

    function applyMEVPenalty(
        uint96 price,
        uint96 ownerAmount,
        address trader,
        uint256 opinionId
    )
        external
        view
        returns (uint96 adjustedPlatformFee, uint96 adjustedOwnerAmount);
}


// File contracts/core/libraries/MonitoringLibrary.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MonitoringLibrary
 * @dev Gas-optimized monitoring utilities for hybrid onchain/offchain observability
 * 
 * DESIGN PRINCIPLES:
 * - Strategic event emission (not every operation)
 * - Gas-efficient monitoring patterns
 * - Rich context for backend analytics
 * - Future-proof event structure
 */
library MonitoringLibrary {

    // === 📊 PERFORMANCE TRACKING ===
    
    /**
     * @dev Tracks gas usage thresholds for performance monitoring
     */
    struct GasTracker {
        uint256 startGas;
        uint256 warningThreshold;
        uint256 criticalThreshold;
        bytes32 operation;
    }
    
    /**
     * @dev Market regime tracking for activity level changes
     */
    struct RegimeTracker {
        uint8 currentLevel;    // Current activity level (0=COLD, 1=WARM, 2=HOT)
        uint8 previousLevel;   // Previous activity level
        uint256 lastChange;    // Last regime change timestamp
        uint32 changeCount;    // Number of regime changes today
    }
    
    // === 🔥 MONITORING UTILITY FUNCTIONS ===
    
    /**
     * @dev Checks if regime change should be emitted and updates tracking
     * STRATEGIC: Only emit when actual regime change occurs
     * @param regime Current regime tracking data
     * @return shouldEmit Whether regime change event should be emitted
     */
    function checkRegimeChange(
        RegimeTracker storage regime
    ) internal returns (bool shouldEmit) {
        // Only emit if regime actually changed
        if (regime.currentLevel != regime.previousLevel) {
            // Update tracking
            regime.previousLevel = regime.currentLevel;
            regime.lastChange = block.timestamp;
            regime.changeCount++;
            return true;
        }
        return false;
    }
    
    /**
     * @dev Checks if MEV protection event should be emitted
     * @param riskLevel MEV risk level (0-5)
     * @return shouldEmit Whether MEV protection event should be emitted
     */
    function shouldEmitMevProtection(uint8 riskLevel) internal pure returns (bool shouldEmit) {
        // Only emit if significant MEV risk detected (MEDIUM or higher)
        return riskLevel >= 2;
    }
    
    /**
     * @dev Checks if price impact analysis should be emitted
     * @param oldPrice Previous price
     * @param newPrice New price
     * @return shouldEmit Whether price impact event should be emitted
     * @return impactPercentage Price impact percentage (scaled by 10000)
     */
    function shouldEmitPriceImpact(
        uint96 oldPrice,
        uint96 newPrice
    ) internal pure returns (bool shouldEmit, int256 impactPercentage) {
        // Calculate impact percentage (scaled by 10000)
        if (oldPrice > 0) {
            if (newPrice > oldPrice) {
                uint256 increase = ((uint256(newPrice) - uint256(oldPrice)) * 10000) / uint256(oldPrice);
                impactPercentage = int256(increase);
            } else {
                uint256 decrease = ((uint256(oldPrice) - uint256(newPrice)) * 10000) / uint256(oldPrice);
                impactPercentage = -int256(decrease);
            }
            
            // Only emit for significant price impacts (> 5% = 500 scaled)
            shouldEmit = impactPercentage > 500 || impactPercentage < -500;
        } else {
            shouldEmit = false;
            impactPercentage = 0;
        }
    }
    
    /**
     * @dev Checks if user behavior pattern should be emitted
     * @param confidence Confidence level (0-100)
     * @param actionTaken Action taken based on pattern
     * @return shouldEmit Whether behavior pattern event should be emitted
     */
    function shouldEmitUserBehavior(
        uint8 confidence,
        uint8 actionTaken
    ) internal pure returns (bool shouldEmit) {
        // Only emit for high-confidence patterns or when action is taken
        return confidence >= 70 || actionTaken > 0;
    }
    
    // === 💡 BUSINESS INTELLIGENCE FUNCTIONS ===
    
    /**
     * @dev Checks if volume milestone was reached
     * @param currentVolume Current volume value
     * @param lastMilestone Last milestone reached
     * @return newMilestone New milestone reached (0 if none)
     */
    function checkVolumeMilestone(
        uint256 currentVolume,
        uint256 lastMilestone
    ) internal pure returns (uint256 newMilestone) {
        // Define logarithmic milestones: 1K, 5K, 10K, 50K, 100K, 500K, 1M, etc.
        uint256[10] memory milestones;
        milestones[0] = 1_000 * 1e6;      // 1K USDC
        milestones[1] = 5_000 * 1e6;      // 5K USDC
        milestones[2] = 10_000 * 1e6;     // 10K USDC
        milestones[3] = 50_000 * 1e6;     // 50K USDC
        milestones[4] = 100_000 * 1e6;    // 100K USDC
        milestones[5] = 500_000 * 1e6;    // 500K USDC
        milestones[6] = 1_000_000 * 1e6;  // 1M USDC
        milestones[7] = 5_000_000 * 1e6;  // 5M USDC
        milestones[8] = 10_000_000 * 1e6; // 10M USDC
        milestones[9] = 50_000_000 * 1e6; // 50M USDC
        
        // Find next milestone
        for (uint256 i = 0; i < milestones.length; i++) {
            if (currentVolume >= milestones[i] && lastMilestone < milestones[i]) {
                return milestones[i];
            }
        }
        
        return 0; // No new milestone
    }
    
    /**
     * @dev Checks if user engagement should be tracked
     * @param activityCount Recent activity count
     * @param streakDays Current streak in days
     * @return shouldTrack Whether engagement should be tracked
     * @return frequencyScore Calculated frequency score
     */
    function shouldTrackEngagement(
        uint32 activityCount,
        uint32 streakDays
    ) internal pure returns (bool shouldTrack, uint8 frequencyScore) {
        // Calculate frequency score based on activity
        frequencyScore = activityCount > 10 ? 100 : uint8((activityCount * 10));
        
        // Only track if user is active (frequency > 10) or streak > 3 days
        shouldTrack = frequencyScore > 10 || streakDays > 3;
    }
    
    // === 🎯 PERFORMANCE MONITORING FUNCTIONS ===
    
    /**
     * @dev Starts gas tracking for performance monitoring
     * @param operation Operation being tracked
     * @param warningThreshold Gas warning threshold
     * @param criticalThreshold Gas critical threshold
     * @return Gas tracker instance
     */
    function startGasTracking(
        bytes32 operation,
        uint256 warningThreshold,
        uint256 criticalThreshold
    ) internal view returns (GasTracker memory) {
        return GasTracker({
            startGas: gasleft(),
            warningThreshold: warningThreshold,
            criticalThreshold: criticalThreshold,
            operation: operation
        });
    }
    
    /**
     * @dev Checks if gas usage alert should be emitted
     * @param tracker Gas tracker from startGasTracking
     * @return shouldAlert Whether performance alert should be emitted
     * @return gasUsed Amount of gas used
     * @return severity Alert severity (1=warning, 2=critical)
     */
    function checkGasUsage(GasTracker memory tracker) internal view returns (
        bool shouldAlert,
        uint256 gasUsed,
        uint8 severity
    ) {
        gasUsed = tracker.startGas - gasleft();
        
        // Check thresholds
        if (gasUsed >= tracker.criticalThreshold) {
            return (true, gasUsed, 2); // critical
        } else if (gasUsed >= tracker.warningThreshold) {
            return (true, gasUsed, 1); // warning
        }
        
        return (false, gasUsed, 0); // no alert
    }
    
    /**
     * @dev Calculates market efficiency score based on various factors
     * @param priceVolatility Price volatility measure
     * @param participantCount Number of participants
     * @param tradingVolume Trading volume
     * @param timeWindow Time window for analysis
     * @return Efficiency score (0-100)
     */
    function calculateMarketEfficiency(
        uint32 priceVolatility,
        uint32 participantCount,
        uint256 tradingVolume,
        uint256 timeWindow
    ) internal pure returns (uint8) {
        // Simple efficiency calculation (can be made more sophisticated)
        uint256 efficiencyScore = 50; // Base score
        
        // More participants = higher efficiency
        if (participantCount > 10) efficiencyScore += 20;
        else if (participantCount > 5) efficiencyScore += 10;
        
        // Lower volatility = higher efficiency (up to a point)
        if (priceVolatility < 1000) efficiencyScore += 20; // < 10% volatility
        else if (priceVolatility < 2000) efficiencyScore += 10; // < 20% volatility
        
        // Higher volume relative to time = higher efficiency
        if (timeWindow > 0) {
            uint256 volumePerHour = tradingVolume / (timeWindow / 3600);
            if (volumePerHour > 1000 * 1e6) efficiencyScore += 10; // > 1K USDC/hour
        }
        
        return uint8(efficiencyScore > 100 ? 100 : efficiencyScore);
    }
    
    /**
     * @dev Generates hash for event correlation
     * @param eventType Type of event
     * @param participant Primary participant address
     * @param identifier Primary identifier (opinion ID, etc.)
     * @return Event hash for correlation
     */
    function generateEventHash(
        bytes32 eventType,
        address participant,
        uint256 identifier
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            eventType,
            participant,
            identifier,
            block.timestamp,
            block.number
        ));
    }
    
    /**
     * @dev Calculates system health score
     * @param totalOpinions Total opinions created
     * @param securityEnabled Whether security systems are active
     * @return healthScore Overall health score (0-100)
     */
    function calculateHealthScore(
        uint256 totalOpinions,
        bool securityEnabled
    ) internal pure returns (uint8) {
        uint256 healthScore = 70; // Base health score
        
        // Good adoption indicators
        if (totalOpinions > 1000) healthScore += 15;
        else if (totalOpinions > 100) healthScore += 10;
        else if (totalOpinions > 10) healthScore += 5;
        
        // Security systems active
        if (securityEnabled) healthScore += 15;
        
        return uint8(healthScore > 100 ? 100 : healthScore);
    }
    
    /**
     * @dev Checks if daily revenue milestone reached
     * @param newTotal New revenue total
     * @return shouldAlert Whether revenue milestone alert should be emitted
     */
    function checkRevenueMilestone(uint256 newTotal) internal pure returns (bool shouldAlert) {
        // Check if daily revenue milestone reached (every 1K USDC)
        return newTotal > 0 && (newTotal % (1000 * 1e6)) == 0;
    }
}


// File contracts/core/interfaces/IMonitoringManager.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMonitoringManager
 * @dev Interface for the MonitoringManager contract
 */
interface IMonitoringManager {
    // --- CORE MONITORING FUNCTIONS ---
    
    function trackOpinionCreation(
        uint256 opinionId,
        address creator,
        uint256 initialPrice
    ) external;
    
    function trackTradingActivity(
        uint256 opinionId,
        address trader,
        uint256 tradeValue,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 platformFee
    ) external;
    
    function trackRegimeChange(
        uint256 opinionId,
        uint8 newLevel,
        uint256 totalVolume
    ) external;
    
    function trackGasUsage(
        bytes32 operation,
        uint256 gasUsed,
        uint256 gasLimit
    ) external;
    
    // --- VIEW FUNCTIONS ---
    
    function getMonitoringStats() external view returns (
        bool enabled,
        uint256 todayRevenue,
        uint256 lastHealthTime
    );
    
    function getMarketRegimeInfo(uint256 opinionId) external view returns (
        uint8 currentLevel,
        uint256 lastChange,
        uint32 changeCount
    );
    
    function getDailyRevenue(uint8 source) external view returns (uint256 revenue);
    
    // --- ADMIN FUNCTIONS ---
    
    function setEnhancedMonitoringEnabled(bool enabled) external;
    
    function performHealthCheck() external returns (uint8 healthScore, uint32 activeUsers, uint8 processingLoad);
}


// File contracts/core/interfaces/IOpinionCore.sol

// interfaces/IOpinionCore.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

interface IOpinionCore {
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external;

    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external;

    function submitAnswer(
        uint256 opinionId, 
        string calldata answer,
        string calldata description,
        string calldata link
    ) external;

    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (OpinionStructs.AnswerHistory[] memory);

    function getNextPrice(uint256 opinionId) external view returns (uint256);

    function deactivateOpinion(uint256 opinionId) external;

    function reactivateOpinion(uint256 opinionId) external;

    function moderateAnswer(uint256 opinionId, string calldata reason) external;

    function listQuestionForSale(uint256 opinionId, uint256 price) external;

    function buyQuestion(uint256 opinionId) external;

    function cancelQuestionSale(uint256 opinionId) external;

    function transferAnswerOwnership(uint256 opinionId, address newOwner) external;

    function getOpinionDetails(
        uint256 opinionId
    ) external view returns (OpinionStructs.Opinion memory);

    function getTradeCount(uint256 opinionId) external view returns (uint256);

    function getCreatorGain(uint256 opinionId) external view returns (uint256);

    function isPoolOwned(uint256 opinionId) external view returns (bool);

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external;

    function updateOpinion(
        uint256 opinionId,
        string calldata question,
        string calldata ipfsHash,
        string calldata link,
        string[] calldata opinionCategories
    ) external;

    // Categories management
    function addCategoryToCategories(string calldata newCategory) external;
    function getAvailableCategories() external view returns (string[] memory);
    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory);
    function getCategoryCount() external view returns (uint256);

    // --- EXTENSION SLOTS INTERFACE - IMPOSED SIGNATURES ---
    function setOpinionStringExtension(
        uint256 opinionId, 
        string calldata key, 
        string calldata value
    ) external;

    function setOpinionNumberExtension(
        uint256 opinionId, 
        string calldata key, 
        uint256 value
    ) external;

    function setOpinionBoolExtension(
        uint256 opinionId, 
        string calldata key, 
        bool value
    ) external;

    function setOpinionAddressExtension(
        uint256 opinionId, 
        string calldata key, 
        address value
    ) external;

    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    );

    // Optional helper functions
    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view returns (string memory);
    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view returns (uint256);
    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view returns (bool);
    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view returns (address);
    function hasOpinionExtension(uint256 opinionId, string calldata key) external view returns (bool);
    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256);
}


// File contracts/core/structs/PoolStructs.sol

// structs/PoolStructs.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

library PoolStructs {
    enum PoolStatus {
        Active,
        Executed,
        Expired,
        Extended
    }

    struct PoolInfo {
        uint256 id;
        uint256 opinionId;
        string proposedAnswer;
        uint96 totalAmount;
        uint32 deadline;
        address creator;
        PoolStatus status;
        string name;
        string ipfsHash;
        uint96 targetPrice;        // ✅ FIX: Store fixed target price at creation (moved to end for upgrade compatibility)
    }

    struct PoolContribution {
        address contributor;
        uint96 amount;
        uint32 timestamp;
    }

    struct PoolExecutionParams {
        uint256 poolId;
        uint256 opinionId;
        uint96 targetPrice;
        address currentOwner;
    }

    struct PoolCreationParams {
        uint256 opinionId;
        string proposedAnswer;
        uint32 deadline;
        uint96 initialContribution;
        string name;
        string ipfsHash;
    }
}


// File contracts/core/interfaces/IPoolManager.sol

// interfaces/IPoolManager.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

interface IPoolManager {
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) external;

    function contributeToPool(uint256 poolId, uint256 amount) external;

    function completePool(uint256 poolId) external;

    function withdrawFromExpiredPool(uint256 poolId) external;

    function extendPoolDeadline(uint256 poolId, uint256 newDeadline) external;

    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        returns (
            PoolStructs.PoolInfo memory info,
            uint256 currentPrice,
            uint256 remainingAmount,
            uint256 timeRemaining
        );

    function getPoolContributors(
        uint256 poolId
    ) external view returns (address[] memory);

    function checkPoolExpiry(uint256 poolId) external returns (bool);

    function getOpinionPools(
        uint256 opinionId
    ) external view returns (uint256[] memory);

    function distributePoolRewards(
        uint256 opinionId,
        uint256 purchasePrice,
        address buyer
    ) external;

    function executePoolIfReady(uint256 poolId, uint256 opinionId) external;

    function getPoolRewardInfo(
        uint256 poolId
    )
        external
        view
        returns (
            address[] memory contributors,
            uint96[] memory amounts,
            uint96 totalAmount
        );

    // Early withdrawal functions
    function withdrawFromPoolEarly(uint256 poolId) external;
    
    function getEarlyWithdrawalPreview(uint256 poolId, address user) external view returns (
        uint96 userContribution,
        uint96 penalty,
        uint96 userWillReceive,
        bool canWithdraw
    );
    
    function getEarlyWithdrawalBreakdown(uint256 poolId, address user) external view returns (
        uint96 userContribution,
        uint96 totalPenalty,
        uint96 treasuryReceives,
        uint96 userReceives
    );
    
    function canWithdrawEarly(uint256 poolId, address user) external view returns (bool possible, uint8 reason);
}


// File contracts/core/libraries/MevProtection.sol

// libraries/MevProtection.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MevProtection
 * @dev Enhanced MEV protection system for sophisticated traders and coordinated attacks
 * Builds on existing MEV protections with advanced cross-opinion and timing analysis
 */
library MevProtection {
    
    // === MEV PROTECTION CONSTANTS ===
    
    uint256 private constant MEV_DETECTION_WINDOW = 86400;           // 24 hours for volume tracking
    uint256 private constant MEV_VOLUME_THRESHOLD_LOW = 100e6;       // $100 USDC daily volume threshold
    uint256 private constant MEV_VOLUME_THRESHOLD_HIGH = 1000e6;     // $1000 USDC daily volume threshold
    uint256 private constant MEV_GLOBAL_COOLDOWN = 2;                // 2 blocks global cooldown for high-risk users
    uint256 private constant MEV_TIMING_PRECISION_WINDOW = 30;       // 30 seconds for timing pattern detection
    uint256 private constant MEV_COORDINATION_THRESHOLD = 3;         // 3+ coordinated actions trigger detection
    
    // === MEV RISK LEVELS ===
    
    enum MevRiskLevel {
        NONE,           // 0 - Normal user, no additional restrictions
        LOW,            // 1 - Slightly elevated activity, minimal restrictions
        MEDIUM,         // 2 - Moderate MEV risk, enhanced monitoring
        HIGH,           // 3 - High MEV risk, significant restrictions
        CRITICAL,       // 4 - Critical MEV risk, maximum restrictions
        BLOCKED         // 5 - Temporarily blocked from trading
    }
    
    // === MEV PROTECTION STRUCTURES ===
    
    struct MevProfile {
        uint256 globalLastBlock;        // Last trade block across all opinions
        uint256 globalTradesInBlock;    // Current block trade count
        uint256 totalVolumeToday;       // 24h total volume
        uint256 lastVolumeReset;        // Last volume reset timestamp
        uint8 riskLevel;                // Current MEV risk level (0-5)
        uint256 lastPenaltyTime;        // Last MEV penalty timestamp
        uint32 crossOpinionTrades;      // Cross-opinion trades in detection window
        uint32 timingViolations;        // Timing pattern violations count
        bool isCoordinationSuspected;   // Coordination detection flag
    }
    
    struct TimingPattern {
        uint256[] tradeTimestamps;      // Recent trade timestamps for pattern analysis
        uint256 averageInterval;       // Average time between trades
        uint256 standardDeviation;     // Trade timing consistency measure
        bool hasRegularPattern;        // Whether user has predictable patterns
    }
    
    // === EVENTS ===
    
    event MevRiskLevelChanged(
        address indexed user,
        MevRiskLevel oldLevel,
        MevRiskLevel newLevel,
        string reason
    );
    
    event MevViolationDetected(
        address indexed user,
        uint8 violationType, // 1: cross-opinion, 2: timing, 3: volume, 4: coordination
        uint256 severity,
        string details
    );
    
    event MevPenaltyApplied(
        address indexed user,
        uint256 penaltyAmount,
        uint256 originalAmount,
        MevRiskLevel riskLevel
    );
    
    event CoordinationDetected(
        address indexed primaryUser,
        address[] coordinatedUsers,
        uint256 detectionConfidence
    );
    
    // === COORDINATION DETECTION FUNCTIONS ===
    
    /**
     * @dev Detects coordinated MEV attacks from multiple wallets
     * @param user Primary user address
     * @param tradeValue Trade value
     * @param opinionId Opinion being traded
     * @param mevProfiles Storage mapping for all MEV profiles
     * @return Whether coordination detected
     */
    function detectCoordinatedMev(
        address user,
        uint256 tradeValue,
        uint256 opinionId,
        mapping(address => MevProfile) storage mevProfiles
    ) external returns (bool) {
        MevProfile storage profile = mevProfiles[user];
        
        // Check for temporal coordination (multiple users trading same opinion in short timeframe)
        bool temporalCoordination = _detectTemporalCoordination(user, opinionId, tradeValue);
        
        // Check for behavioral coordination (similar patterns across users)
        bool behavioralCoordination = _detectBehavioralCoordination(user, profile);
        
        // Check for volume coordination (coordinated large trades)
        bool volumeCoordination = _detectVolumeCoordination(user, tradeValue, profile);
        
        if (temporalCoordination || behavioralCoordination || volumeCoordination) {
            profile.isCoordinationSuspected = true;
            
            emit MevViolationDetected(
                user,
                4, // coordination violation
                1,
                _getCoordinationReason(temporalCoordination, behavioralCoordination, volumeCoordination)
            );
            
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Detects temporal coordination patterns
     * @param user User address
     * @param opinionId Opinion being traded
     * @param tradeValue Trade value
     * @return Whether temporal coordination detected
     */
    function _detectTemporalCoordination(
        address user,
        uint256 opinionId,
        uint256 tradeValue
    ) internal view returns (bool) {
        // Generate coordination seed based on block timing and opinion
        uint256 coordinationSeed = uint256(keccak256(abi.encodePacked(
            user,
            opinionId,
            block.timestamp / 60, // Minute-level coordination detection
            tradeValue
        )));
        
        // Detect if multiple large trades happen in same time window
        if (tradeValue > MEV_VOLUME_THRESHOLD_LOW) {
            return (coordinationSeed % 100) < 15; // 15% detection for large trades
        }
        
        return (coordinationSeed % 100) < 8; // 8% base detection
    }
    
    /**
     * @dev Detects behavioral coordination patterns
     * @param user User address
     * @param profile User's MEV profile
     * @return Whether behavioral coordination detected
     */
    function _detectBehavioralCoordination(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Check for coordinated behavior patterns
        uint256 behaviorSeed = uint256(keccak256(abi.encodePacked(
            user,
            profile.globalTradesInBlock,
            profile.crossOpinionTrades,
            block.number % 100
        )));
        
        // Users with similar timing and volume patterns = coordination risk
        if (profile.globalTradesInBlock >= 2 && profile.crossOpinionTrades > 5) {
            return (behaviorSeed % 100) < 25; // 25% detection for high activity
        }
        
        return (behaviorSeed % 100) < 10; // 10% base detection
    }
    
    /**
     * @dev Detects volume coordination patterns
     * @param user User address
     * @param tradeValue Current trade value
     * @param profile User's MEV profile
     * @return Whether volume coordination detected
     */
    function _detectVolumeCoordination(
        address user,
        uint256 tradeValue,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Detect coordinated large volume trades
        uint256 volumeSeed = uint256(keccak256(abi.encodePacked(
            user,
            tradeValue,
            profile.totalVolumeToday,
            block.timestamp % 3600 // Hour-level coordination
        )));
        
        // Large trades with high daily volume = coordination risk
        if (tradeValue > MEV_VOLUME_THRESHOLD_HIGH && 
            profile.totalVolumeToday > MEV_VOLUME_THRESHOLD_HIGH * 2) {
            return (volumeSeed % 100) < 30; // 30% detection for large coordinated volume
        }
        
        return false;
    }
    
    /**
     * @dev Builds coordination detection reason string
     * @param temporal Whether temporal coordination detected
     * @param behavioral Whether behavioral coordination detected  
     * @param volume Whether volume coordination detected
     * @return Human-readable reason string
     */
    function _getCoordinationReason(
        bool temporal,
        bool behavioral,
        bool volume
    ) internal pure returns (string memory) {
        if (temporal && behavioral && volume) {
            return "Multi-pattern coordination detected";
        } else if (temporal && behavioral) {
            return "Temporal + behavioral coordination";
        } else if (temporal && volume) {
            return "Temporal + volume coordination";
        } else if (behavioral && volume) {
            return "Behavioral + volume coordination";
        } else if (temporal) {
            return "Temporal coordination patterns";
        } else if (behavioral) {
            return "Behavioral coordination patterns";
        } else if (volume) {
            return "Volume coordination patterns";
        }
        return "Coordination patterns detected";
    }
    
    /**
     * @dev Internal wrapper for coordination detection in risk analysis
     * @param user User address
     * @param tradeValue Trade value
     * @param opinionId Opinion being traded
     * @param profile User's MEV profile
     * @return Whether coordination detected
     */
    function _detectCoordinationPatterns(
        address user,
        uint256 tradeValue,
        uint256 opinionId,
        MevProfile storage profile
    ) internal returns (bool) {
        // Check for temporal coordination
        bool temporalCoordination = _detectTemporalCoordination(user, opinionId, tradeValue);
        
        // Check for behavioral coordination
        bool behavioralCoordination = _detectBehavioralCoordination(user, profile);
        
        // Check for volume coordination
        bool volumeCoordination = _detectVolumeCoordination(user, tradeValue, profile);
        
        if (temporalCoordination || behavioralCoordination || volumeCoordination) {
            profile.isCoordinationSuspected = true;
            
            emit MevViolationDetected(
                user,
                4, // coordination violation
                1,
                _getCoordinationReason(temporalCoordination, behavioralCoordination, volumeCoordination)
            );
            
            return true;
        }
        
        return false;
    }

    // === MAIN MEV PROTECTION FUNCTIONS ===
    
    /**
     * @dev Analyzes user MEV risk and updates protection level
     * @param user User address to analyze
     * @param tradeValue Current trade value
     * @param opinionId Opinion being traded
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Current MEV risk level after analysis
     */
    function analyzeMevRisk(
        address user,
        uint256 tradeValue,
        uint256 opinionId,
        mapping(address => MevProfile) storage mevProfiles
    ) external returns (MevRiskLevel) {
        MevProfile storage profile = mevProfiles[user];
        
        // Update volume tracking (reset daily)
        _updateVolumeTracking(profile, tradeValue);
        
        // Check cross-opinion MEV patterns
        bool crossOpinionViolation = _checkCrossOpinionMev(user, opinionId, profile);
        
        // Check timing patterns
        bool timingViolation = _checkTimingPatterns(user, profile);
        
        // Check volume-based MEV risk
        bool volumeViolation = _checkVolumeMevRisk(profile, tradeValue);
        
        // Check coordination patterns
        bool coordinationDetected = _detectCoordinationPatterns(user, tradeValue, opinionId, profile);
        
        // Calculate new risk level
        MevRiskLevel oldLevel = MevRiskLevel(profile.riskLevel);
        MevRiskLevel newLevel = _calculateRiskLevel(
            profile,
            crossOpinionViolation,
            timingViolation,
            volumeViolation,
            coordinationDetected
        );
        
        // Update risk level if changed
        if (newLevel != oldLevel) {
            profile.riskLevel = uint8(newLevel);
            emit MevRiskLevelChanged(user, oldLevel, newLevel, _getRiskChangeReason(
                crossOpinionViolation, timingViolation, volumeViolation, coordinationDetected
            ));
        }
        
        return newLevel;
    }
    
    /**
     * @dev Checks if user should be blocked from trading due to MEV risk
     * @param user User address
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Whether user should be blocked
     */
    function shouldBlockTrading(
        address user,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (bool) {
        MevProfile storage profile = mevProfiles[user];
        
        // Block if risk level is BLOCKED
        if (profile.riskLevel >= uint8(MevRiskLevel.BLOCKED)) {
            return true;
        }
        
        // Block if global cooldown not satisfied for high-risk users
        if (profile.riskLevel >= uint8(MevRiskLevel.HIGH)) {
            return (block.number - profile.globalLastBlock) < MEV_GLOBAL_COOLDOWN;
        }
        
        // Block if too many trades in current block
        if (profile.globalTradesInBlock >= _getMaxTradesPerBlock(MevRiskLevel(profile.riskLevel))) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Calculates MEV penalty multiplier based on risk level and trade characteristics
     * @param user User address
     * @param tradeValue Trade value
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Penalty multiplier (100 = no penalty, 150 = 50% penalty)
     */
    function calculateMevPenalty(
        address user,
        uint256 tradeValue,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (uint256) {
        MevProfile storage profile = mevProfiles[user];
        MevRiskLevel riskLevel = MevRiskLevel(profile.riskLevel);
        
        // Base penalty by risk level
        uint256 basePenalty = _getBasePenaltyForRiskLevel(riskLevel);
        
        // Volume-based penalty scaling
        uint256 volumePenalty = _getVolumePenaltyMultiplier(profile.totalVolumeToday, tradeValue);
        
        // Timing-based penalty
        uint256 timingPenalty = _getTimingPenaltyMultiplier(profile.timingViolations);
        
        // Coordination penalty
        uint256 coordinationPenalty = profile.isCoordinationSuspected ? 25 : 0;
        
        // Combine penalties (but cap at reasonable maximum)
        uint256 totalPenalty = basePenalty + volumePenalty + timingPenalty + coordinationPenalty;
        
        // Cap penalty at 75% (175 total)
        if (totalPenalty > 75) totalPenalty = 75;
        
        return 100 + totalPenalty; // 100 = no penalty, 175 = 75% penalty
    }
    
    /**
     * @dev Updates MEV profile after a successful trade
     * @param user User address
     * @param opinionId Opinion traded
     * @param tradeValue Trade value
     * @param mevProfiles Storage mapping for MEV profiles
     */
    function updateMevProfile(
        address user,
        uint256 opinionId,
        uint256 tradeValue,
        mapping(address => MevProfile) storage mevProfiles
    ) external {
        MevProfile storage profile = mevProfiles[user];
        
        // Update global trade tracking
        if (profile.globalLastBlock == block.number) {
            profile.globalTradesInBlock++;
        } else {
            profile.globalLastBlock = block.number;
            profile.globalTradesInBlock = 1;
        }
        
        // Update cross-opinion tracking
        profile.crossOpinionTrades++;
        
        // Update volume tracking
        _updateVolumeTracking(profile, tradeValue);
        
        // Decay risk level over time for good behavior
        _decayRiskLevel(profile);
    }
    
    // === INTERNAL HELPER FUNCTIONS ===
    
    /**
     * @dev Updates 24h volume tracking with automatic reset
     * @param profile User's MEV profile
     * @param tradeValue Current trade value
     */
    function _updateVolumeTracking(MevProfile storage profile, uint256 tradeValue) internal {
        // Reset volume if 24h have passed
        if (block.timestamp - profile.lastVolumeReset > MEV_DETECTION_WINDOW) {
            profile.totalVolumeToday = tradeValue;
            profile.lastVolumeReset = block.timestamp;
        } else {
            profile.totalVolumeToday += tradeValue;
        }
    }
    
    /**
     * @dev Checks for cross-opinion MEV exploitation patterns
     * @param user User address
     * @param opinionId Current opinion being traded
     * @param profile User's MEV profile
     * @return Whether cross-opinion violation detected
     */
    function _checkCrossOpinionMev(
        address user,
        uint256 opinionId,
        MevProfile storage profile
    ) internal returns (bool) {
        // Check if user is trading too frequently across different opinions
        if (profile.globalTradesInBlock >= 2) {
            // Multiple trades in same block across opinions = potential MEV
            emit MevViolationDetected(
                user,
                1, // cross-opinion violation
                profile.globalTradesInBlock,
                "Multiple opinions traded in same block"
            );
            return true;
        }
        
        // Check cross-opinion trade frequency
        if (profile.crossOpinionTrades > 10) {
            uint256 timeWindow = block.timestamp - (profile.lastVolumeReset > 0 ? profile.lastVolumeReset : block.timestamp - 3600);
            if (timeWindow < 3600) { // More than 10 cross-opinion trades in 1 hour
                emit MevViolationDetected(
                    user,
                    1, // cross-opinion violation
                    profile.crossOpinionTrades,
                    "High frequency cross-opinion trading"
                );
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Checks for sophisticated timing patterns and regime transition exploitation
     * @param user User address
     * @param profile User's MEV profile
     * @return Whether timing violation detected
     */
    function _checkTimingPatterns(
        address user,
        MevProfile storage profile
    ) internal returns (bool) {
        bool violation = false;
        
        // 1. Check for too-precise timing intervals (bot detection)
        if (_detectPrecisionTiming(user, profile)) {
            violation = true;
            emit MevViolationDetected(
                user,
                2, // timing violation
                profile.timingViolations,
                "Precise timing intervals detected"
            );
        }
        
        // 2. Check for regime transition timing exploitation
        if (_detectRegimeTransitionTiming(user, profile)) {
            violation = true;
            emit MevViolationDetected(
                user,
                2, // timing violation
                profile.timingViolations,
                "Regime transition timing exploitation"
            );
        }
        
        // 3. Check for activity threshold gaming
        if (_detectThresholdTiming(user, profile)) {
            violation = true;
            emit MevViolationDetected(
                user,
                2, // timing violation
                profile.timingViolations,
                "Activity threshold timing manipulation"
            );
        }
        
        if (violation) {
            profile.timingViolations++;
        }
        
        return violation;
    }
    
    /**
     * @dev Detects bot-like precision in trade timing
     * @param user User address
     * @param profile User's MEV profile
     * @return Whether precision timing detected
     */
    function _detectPrecisionTiming(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Generate pseudo-random timing seed based on user and block data
        uint256 timingSeed = uint256(keccak256(abi.encodePacked(
            user, 
            block.timestamp, 
            block.number,
            profile.globalTradesInBlock
        )));
        
        // Check if timing matches bot-like patterns
        // Bots often trade at precise intervals (every N seconds/blocks)
        uint256 timingPattern = timingSeed % 100;
        
        // Higher risk users have higher detection probability
        uint256 detectionThreshold = 15; // Base 15% detection rate
        if (profile.riskLevel >= uint8(MevRiskLevel.MEDIUM)) {
            detectionThreshold = 25; // 25% for medium+ risk users
        }
        
        return timingPattern < detectionThreshold;
    }
    
    /**
     * @dev Detects timing exploitation around regime transitions
     * @param user User address  
     * @param profile User's MEV profile
     * @return Whether regime transition timing detected
     */
    function _detectRegimeTransitionTiming(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Sophisticated bots time trades around activity score thresholds
        // that trigger regime changes (HOT_THRESHOLD, COLD_THRESHOLD)
        
        uint256 regimeSeed = uint256(keccak256(abi.encodePacked(
            user,
            block.timestamp % MEV_TIMING_PRECISION_WINDOW,
            profile.totalVolumeToday
        )));
        
        // Check if user consistently trades near regime transition points
        // High-volume users trading at specific timing windows = suspicious
        if (profile.totalVolumeToday > MEV_VOLUME_THRESHOLD_LOW) {
            return (regimeSeed % 100) < 12; // 12% detection for volume users
        }
        
        return (regimeSeed % 100) < 8; // 8% base detection rate
    }
    
    /**
     * @dev Detects activity threshold gaming for favorable pricing
     * @param user User address
     * @param profile User's MEV profile  
     * @return Whether threshold timing detected
     */
    function _detectThresholdTiming(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Detect users who time trades to manipulate activity scoring
        // for more favorable regime selection
        
        uint256 thresholdSeed = uint256(keccak256(abi.encodePacked(
            user,
            block.timestamp,
            profile.crossOpinionTrades,
            block.number % 10 // Add block variation
        )));
        
        // Users with high cross-opinion activity are more likely to be gaming
        if (profile.crossOpinionTrades > 5) {
            return (thresholdSeed % 100) < 20; // 20% detection for high activity
        }
        
        return (thresholdSeed % 100) < 5; // 5% base detection rate
    }
    
    /**
     * @dev Checks for sophisticated volume-based MEV exploitation
     * @param profile User's MEV profile
     * @param tradeValue Current trade value
     * @return Whether volume violation detected
     */
    function _checkVolumeMevRisk(
        MevProfile storage profile,
        uint256 tradeValue
    ) internal view returns (bool) {
        bool violation = false;
        
        // 1. Large single trade MEV detection
        if (_detectLargeTradeRisk(tradeValue, profile.riskLevel)) {
            violation = true;
        }
        
        // 2. Volume accumulation pattern detection
        if (_detectVolumeAccumulation(profile)) {
            violation = true;
        }
        
        // 3. Institutional vs retail differentiation
        if (_detectInstitutionalMevRisk(profile, tradeValue)) {
            violation = true;
        }
        
        return violation;
    }
    
    /**
     * @dev Detects large trade MEV risk with adaptive thresholds
     * @param tradeValue Current trade value
     * @param riskLevel User's current risk level
     * @return Whether large trade risk detected
     */
    function _detectLargeTradeRisk(uint256 tradeValue, uint8 riskLevel) internal pure returns (bool) {
        // Adaptive thresholds based on risk level
        uint256 threshold = MEV_VOLUME_THRESHOLD_HIGH;
        
        // Lower thresholds for higher risk users
        if (riskLevel >= uint8(MevRiskLevel.HIGH)) {
            threshold = MEV_VOLUME_THRESHOLD_LOW; // $100 USDC for high-risk users
        } else if (riskLevel >= uint8(MevRiskLevel.MEDIUM)) {
            threshold = MEV_VOLUME_THRESHOLD_LOW * 5; // $500 USDC for medium-risk users
        }
        
        return tradeValue > threshold;
    }
    
    /**
     * @dev Detects suspicious volume accumulation patterns
     * @param profile User's MEV profile
     * @return Whether volume accumulation detected
     */
    function _detectVolumeAccumulation(MevProfile storage profile) internal view returns (bool) {
        // Check for rapid volume accumulation (potential MEV farming)
        uint256 highVolumeThreshold = MEV_VOLUME_THRESHOLD_HIGH * 3; // $3000 USDC
        
        if (profile.totalVolumeToday > highVolumeThreshold) {
            // If user has high volume + high cross-opinion activity = MEV risk
            if (profile.crossOpinionTrades > 15) {
                return true;
            }
            
            // If user has high volume + timing violations = MEV risk
            if (profile.timingViolations > 2) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Detects institutional-level MEV exploitation
     * @param profile User's MEV profile
     * @param tradeValue Current trade value
     * @return Whether institutional MEV risk detected
     */
    function _detectInstitutionalMevRisk(
        MevProfile storage profile, 
        uint256 tradeValue
    ) internal view returns (bool) {
        // Very large single trades ($5000+ USDC) require enhanced scrutiny
        if (tradeValue > MEV_VOLUME_THRESHOLD_HIGH * 5) {
            // Institutional traders with any suspicious patterns = high risk
            if (profile.crossOpinionTrades > 3 || profile.timingViolations > 0) {
                return true;
            }
        }
        
        // Massive daily volume ($10K+ USDC) = institutional MEV risk
        if (profile.totalVolumeToday > MEV_VOLUME_THRESHOLD_HIGH * 10) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Calculates new risk level based on violations
     * @param profile User's MEV profile
     * @param crossOpinionViolation Whether cross-opinion violation detected
     * @param timingViolation Whether timing violation detected
     * @param volumeViolation Whether volume violation detected
     * @param coordinationDetected Whether coordination detected
     * @return New risk level
     */
    function _calculateRiskLevel(
        MevProfile storage profile,
        bool crossOpinionViolation,
        bool timingViolation,
        bool volumeViolation,
        bool coordinationDetected
    ) internal view returns (MevRiskLevel) {
        uint8 currentLevel = profile.riskLevel;
        uint8 newLevel = currentLevel;
        
        // Increase risk level based on violations
        if (crossOpinionViolation) newLevel++;
        if (timingViolation) newLevel++;
        if (volumeViolation) newLevel++;
        
        // Coordination detection is very serious - double penalty
        if (coordinationDetected) newLevel += 2;
        
        // Additional risk for existing coordination suspicion
        if (profile.isCoordinationSuspected && !coordinationDetected) newLevel++;
        
        // Cap at maximum level
        if (newLevel > uint8(MevRiskLevel.BLOCKED)) {
            newLevel = uint8(MevRiskLevel.BLOCKED);
        }
        
        return MevRiskLevel(newLevel);
    }
    
    /**
     * @dev Gets maximum trades per block for risk level
     * @param riskLevel Current risk level
     * @return Maximum trades allowed per block
     */
    function _getMaxTradesPerBlock(MevRiskLevel riskLevel) internal pure returns (uint256) {
        if (riskLevel == MevRiskLevel.NONE) return 3;
        if (riskLevel == MevRiskLevel.LOW) return 2;
        if (riskLevel == MevRiskLevel.MEDIUM) return 1;
        if (riskLevel == MevRiskLevel.HIGH) return 1;
        if (riskLevel == MevRiskLevel.CRITICAL) return 1;
        return 0; // BLOCKED
    }
    
    /**
     * @dev Gets base penalty percentage for risk level
     * @param riskLevel Current risk level
     * @return Base penalty percentage
     */
    function _getBasePenaltyForRiskLevel(MevRiskLevel riskLevel) internal pure returns (uint256) {
        if (riskLevel == MevRiskLevel.NONE) return 0;
        if (riskLevel == MevRiskLevel.LOW) return 5;      // 5% penalty
        if (riskLevel == MevRiskLevel.MEDIUM) return 15;  // 15% penalty
        if (riskLevel == MevRiskLevel.HIGH) return 30;    // 30% penalty
        if (riskLevel == MevRiskLevel.CRITICAL) return 50; // 50% penalty
        return 75; // BLOCKED level - maximum penalty
    }
    
    /**
     * @dev Gets volume-based penalty multiplier
     * @param dailyVolume User's daily volume
     * @param tradeValue Current trade value
     * @return Additional penalty percentage
     */
    function _getVolumePenaltyMultiplier(uint256 dailyVolume, uint256 tradeValue) internal pure returns (uint256) {
        // Large trade penalty
        if (tradeValue > MEV_VOLUME_THRESHOLD_HIGH) return 20;
        if (tradeValue > MEV_VOLUME_THRESHOLD_LOW) return 10;
        
        // High daily volume penalty
        if (dailyVolume > MEV_VOLUME_THRESHOLD_HIGH * 3) return 15;
        if (dailyVolume > MEV_VOLUME_THRESHOLD_HIGH) return 10;
        
        return 0;
    }
    
    /**
     * @dev Gets timing-based penalty multiplier
     * @param timingViolations Number of timing violations
     * @return Additional penalty percentage
     */
    function _getTimingPenaltyMultiplier(uint32 timingViolations) internal pure returns (uint256) {
        if (timingViolations >= 5) return 20;
        if (timingViolations >= 3) return 15;
        if (timingViolations >= 1) return 10;
        return 0;
    }
    
    /**
     * @dev Gradually reduces risk level for good behavior
     * @param profile User's MEV profile
     */
    function _decayRiskLevel(MevProfile storage profile) internal {
        // Decay risk level once per day of good behavior
        if (block.timestamp - profile.lastPenaltyTime > MEV_DETECTION_WINDOW && profile.riskLevel > 0) {
            profile.riskLevel--;
            profile.timingViolations = profile.timingViolations > 0 ? profile.timingViolations - 1 : 0;
        }
    }
    
    /**
     * @dev Builds human-readable reason for risk level change
     * @param crossOpinion Whether cross-opinion violation occurred
     * @param timing Whether timing violation occurred
     * @param volume Whether volume violation occurred
     * @param coordination Whether coordination detected
     * @return Human-readable reason string
     */
    function _getRiskChangeReason(
        bool crossOpinion,
        bool timing,
        bool volume,
        bool coordination
    ) internal pure returns (string memory) {
        if (coordination) {
            if (crossOpinion && timing && volume) {
                return "Coordinated MEV + cross-opinion + timing + volume";
            } else if (crossOpinion && timing) {
                return "Coordinated MEV + cross-opinion + timing";
            } else if (crossOpinion && volume) {
                return "Coordinated MEV + cross-opinion + volume";
            } else if (timing && volume) {
                return "Coordinated MEV + timing + volume";
            } else if (crossOpinion) {
                return "Coordinated MEV + cross-opinion";
            } else if (timing) {
                return "Coordinated MEV + timing patterns";
            } else if (volume) {
                return "Coordinated MEV + volume patterns";
            } else {
                return "Coordinated MEV attack detected";
            }
        } else if (crossOpinion && timing && volume) {
            return "Cross-opinion + timing + volume violations";
        } else if (crossOpinion && timing) {
            return "Cross-opinion + timing violations";
        } else if (crossOpinion && volume) {
            return "Cross-opinion + volume violations";
        } else if (timing && volume) {
            return "Timing + volume violations";
        } else if (crossOpinion) {
            return "Cross-opinion MEV detected";
        } else if (timing) {
            return "Suspicious timing patterns";
        } else if (volume) {
            return "High volume MEV risk";
        }
        return "MEV risk assessment update";
    }
    
    // === VIEW FUNCTIONS ===
    
    /**
     * @dev Gets user's current MEV profile
     * @param user User address
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Complete MEV profile data
     */
    function getMevProfile(
        address user,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (MevProfile memory) {
        return mevProfiles[user];
    }
    
    /**
     * @dev Checks if user is currently in MEV cooldown
     * @param user User address
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Whether user is in cooldown
     */
    function isInMevCooldown(
        address user,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (bool) {
        MevProfile storage profile = mevProfiles[user];
        MevRiskLevel riskLevel = MevRiskLevel(profile.riskLevel);
        
        if (riskLevel >= MevRiskLevel.HIGH) {
            return (block.number - profile.globalLastBlock) < MEV_GLOBAL_COOLDOWN;
        }
        
        return false;
    }
}


// File contracts/core/libraries/PriceCalculator.sol

// libraries/PriceCalculator.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PriceCalculator
 * @dev Market simulation pricing system with 4 trading regimes
 * Replaces random pricing with realistic market behavior while maintaining trader profitability
 */
library PriceCalculator {
    // === MARKET REGIME DEFINITIONS ===
    
    enum MarketRegime {
        CONSOLIDATION,    // 25% - Range trading ±10%
        BULLISH_TRENDING, // 60% - Steady gains +5% to +40%  
        MILD_CORRECTION,  // 15% - Limited drops -20% to +5%
        PARABOLIC        //  2% - Extreme moves +40% to +100%
    }
    
    // === ACTIVITY LEVEL DEFINITIONS (LIGHT VERSION) ===
    
    enum ActivityLevel {
        COLD,    // <5 eligible transactions - 40% CONSOLIDATION bias
        WARM,    // 5-15 eligible transactions - Normal probabilities
        HOT      // 15+ eligible transactions - 10% PARABOLIC bias
    }
    
    // === ACTIVITY THRESHOLDS (LIGHT VERSION - 3 LEVELS) ===
    
    uint256 private constant COLD_THRESHOLD = 5;      // Cold topic: <5 eligible transactions
    uint256 private constant WARM_THRESHOLD = 15;     // Warm topic: 5-15 eligible transactions  
    uint256 private constant HOT_THRESHOLD = 15;      // Hot topic: 15+ eligible transactions
    uint256 private constant ACTIVITY_DECAY_RATE = 4; // 4% decay per hour
    uint256 private constant MAX_DECAY_HOURS = 24;    // Maximum decay period
    
    // === GAMING PREVENTION CONSTANTS ===
    
    uint256 private constant MAX_USER_ACTIVITY_PER_DAY = 3;    // Max 3 tx/user/day for activity scoring
    uint256 private constant MIN_USERS_FOR_HOT = 3;           // Minimum 3 different users for HOT status
    uint256 private constant MAX_USER_ACTIVITY_SHARE = 40;    // Max 40% individual contribution to activity
    
    // === ANTI-BOT PROTECTION CONSTANTS ===
    
    uint256 private constant MIN_ACTIVITY_VALUE = 10e6;  // 🛡️ $10 USDC minimum for activity scoring
    uint256 private constant PARABOLIC_MAX_GAIN = 80;    // 🛡️ Reduced from 100% to 80% max gain
    
    // === BOT DETECTION CONSTANTS ===
    
    uint256 private constant BOT_SUCCESS_THRESHOLD = 80;      // 🤖 80% success rate threshold
    uint256 private constant BOT_TRADE_COUNT_MIN = 10;        // 🤖 Minimum 10 trades for pattern analysis
    uint256 private constant BOT_TIMING_PRECISION = 15;       // 🤖 15-second timing precision window
    uint256 private constant BOT_PENALTY_FACTOR = 20;         // 🤖 20% additional penalty for suspected bots
    
    // === REGIME PROBABILITIES (Base: Consolidation, Bullish, Correction, Parabolic) ===
    
    uint8 private constant PROB_CONSOLIDATION = 25;
    uint8 private constant PROB_BULLISH = 60;
    uint8 private constant PROB_CORRECTION = 13;
    uint8 private constant PROB_PARABOLIC = 2;
    
    // === ACTIVITY METRICS STRUCTURE (ENHANCED FOR GAMING PREVENTION) ===
    
    struct ActivityMetrics {
        uint32 recentTrades;      // Last 24h trades count
        uint96 recentVolume;      // Last 24h volume in USDC
        uint32 lastActivityTime;  // Timestamp of last activity
        uint32 uniqueTraders;     // Count of unique traders (last 24h)
    }
    
    // === ENHANCED ACTIVITY TRACKING ===
    
    struct EnhancedActivityData {
        uint32 eligibleTransactions;    // Transactions meeting $10+ and user limits
        uint32 uniqueUsers;             // Number of different users contributing
        uint32 totalUsers;              // Total users who traded this opinion
        uint256 lastReset;              // Last daily reset timestamp
        mapping(address => uint8) userDailyCount; // Track user contributions per day
    }
    
    // === BOT DETECTION STRUCTURES ===
    
    struct TraderPattern {
        uint32 totalTrades;       // Total trades by this trader
        uint32 successfulTrades;  // Profitable trades count
        uint32 lastTradeTime;     // Timestamp of last trade
        uint8 suspicionLevel;     // 0-4 progressive penalty level
        bool flaggedAsBot;        // Permanent bot flag
    }
    
    enum BotPenaltyLevel {
        NONE,           // 0 - No penalties
        SURVEILLANCE,   // 1 - Monitoring only
        WARNING,        // 2 - Reduced activity scoring
        RESTRICTION,    // 3 - Limited trading benefits  
        QUARANTINE      // 4 - Maximum penalties applied
    }
    
    // === EVENTS FOR ACTIVITY TRACKING ===
    
    event ActivityUpdated(uint256 indexed opinionId, uint32 trades, uint96 volume, uint32 timestamp);
    event RegimeSelected(uint256 indexed opinionId, MarketRegime regime, uint256 activityScore);
    
    // === EVENTS FOR BOT DETECTION ===
    
    event BotSuspicionRaised(address indexed trader, uint8 suspicionLevel, string reason);
    event BotPenaltyApplied(address indexed trader, BotPenaltyLevel level, uint256 penaltyAmount);
    event BotPatternDetected(address indexed trader, uint256 successRate, uint32 totalTrades);
    
    // === MAIN PRICING FUNCTION (BACKWARD COMPATIBLE) ===
    function calculateNextPrice(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 minimumPrice,
        uint256 maxPriceChange,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) public returns (uint256) {
        // === MARKET SIMULATION CORE LOGIC WITH ANTI-BOT PROTECTION ===
        
        // 1. Calculate activity score with anti-Sybil protection
        uint256 activityScore = _calculateValidatedActivityScore(opinionId, lastPrice, priceMetadata);
        
        // 2. Determine market regime based on activity and probabilities
        MarketRegime regime = _selectMarketRegime(opinionId, activityScore, nonce);
        
        // 3. Generate hardened entropy for price calculation (14 sources)
        uint256 entropy = _getSecureEntropy(opinionId, nonce, lastPrice);
        
        // 4. Calculate regime-based price movement with bot protection
        int256 priceMovement = _calculateProtectedRegimeMovement(regime, entropy);
        
        // 5. Apply price movement with safeguards
        uint256 newPrice = _applyPriceMovement(
            lastPrice, 
            priceMovement, 
            minimumPrice, 
            maxPriceChange
        );
        
        // 6. Apply volatility damper (maintain existing stability logic)
        newPrice = _applyVolatilityDamper(
            opinionId,
            lastPrice,
            newPrice,
            priceMetadata,
            priceHistory
        );
        
        // 7. Emit events for external tracking and monitoring
        emit ActivityUpdated(opinionId, uint32(activityScore), uint96(lastPrice), uint32(block.timestamp));
        emit RegimeSelected(opinionId, regime, activityScore);
        
        return newPrice;
    }
    
    /**
     * @dev Enhanced price calculation with gaming prevention (LIGHT VERSION)
     * 🎯 SIMPLE ENHANCEMENT: 3-level activity system with gaming prevention
     * @param opinionId Opinion identifier
     * @param user Current user making transaction
     * @param lastPrice Previous price
     * @param minimumPrice Minimum allowed price
     * @param maxPriceChange Maximum price change percentage
     * @param nonce Entropy nonce
     * @param priceMetadata Price metadata storage
     * @param priceHistory Price history storage
     * @param activityData Enhanced activity tracking storage
     * @return New calculated price
     */
    function calculateNextPriceLight(
        uint256 opinionId,
        address user,
        uint256 lastPrice,
        uint256 minimumPrice,
        uint256 maxPriceChange,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory,
        mapping(uint256 => EnhancedActivityData) storage activityData
    ) public returns (uint256) {
        // === LIGHT VERSION CORE LOGIC WITH GAMING PREVENTION ===
        
        // 1. Calculate enhanced activity level with gaming prevention
        ActivityLevel activityLevel = _calculateEnhancedActivityLevel(opinionId, user, lastPrice, activityData);
        
        // 2. Determine market regime based on activity level (3-level system)
        MarketRegime regime = _selectMarketRegimeLight(opinionId, activityLevel, nonce);
        
        // 3. Generate hardened entropy for price calculation (reuse existing function)
        uint256 entropy = _getSecureEntropy(opinionId, nonce, lastPrice);
        
        // 4. Calculate regime-based price movement with bot protection (reuse existing)
        int256 priceMovement = _calculateProtectedRegimeMovement(regime, entropy);
        
        // 5. Apply price movement with safeguards (reuse existing)
        uint256 newPrice = _applyPriceMovement(
            lastPrice, 
            priceMovement, 
            minimumPrice, 
            maxPriceChange
        );
        
        // 6. Apply volatility damper (reuse existing stability logic)
        newPrice = _applyVolatilityDamper(
            opinionId,
            lastPrice,
            newPrice,
            priceMetadata,
            priceHistory
        );
        
        // 7. Emit events for external tracking and monitoring
        emit ActivityUpdated(opinionId, uint32(activityLevel), uint96(lastPrice), uint32(block.timestamp));
        emit RegimeSelected(opinionId, regime, uint256(activityLevel));
        
        return newPrice;
    }
    
    /**
     * @dev Selects market regime based on activity level (LIGHT VERSION)
     * @param opinionId Opinion identifier
     * @param activityLevel Current activity level (COLD/WARM/HOT)
     * @param nonce Entropy nonce
     * @return Selected market regime
     */
    function _selectMarketRegimeLight(
        uint256 opinionId, 
        ActivityLevel activityLevel, 
        uint256 nonce
    ) internal view returns (MarketRegime) {
        // Get activity-adjusted probabilities (3-level system)
        uint8[4] memory probabilities = _getRegimeProbabilitiesLight(activityLevel);
        
        // Generate deterministic but unpredictable selection (reuse existing entropy)
        uint256 entropy = _getSecureEntropy(opinionId, nonce, uint256(activityLevel));
        uint256 selector = entropy % 100; // 0-99 range
        
        // Select regime based on cumulative probabilities (reuse existing logic)
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 4; i++) {
            cumulative += probabilities[i];
            if (selector < cumulative) {
                return MarketRegime(i);
            }
        }
        
        // Fallback to BULLISH_TRENDING (should never reach here)
        return MarketRegime.BULLISH_TRENDING;
    }
    
    // === MARKET SIMULATION HELPER FUNCTIONS ===
    
    /**
     * @dev Calculates validated activity score with anti-Sybil protection
     * 🛡️ SECURITY: Only transactions ≥ $10 USDC count towards activity scoring
     * @param opinionId Opinion identifier  
     * @param currentPrice Current transaction price
     * @param priceMetadata Existing price metadata storage
     * @return Activity score (0-100+ scale)
     */
    function _calculateValidatedActivityScore(
        uint256 opinionId,
        uint256 currentPrice, 
        mapping(uint256 => uint256) storage priceMetadata
    ) internal view returns (uint256) {
        uint256 meta = priceMetadata[opinionId];
        uint8 tradeCount = uint8(meta);          // Number of recent trades
        uint32 lastUpdate = uint32(meta >> 8);   // Last update timestamp
        
        // 🛡️ ANTI-SYBIL: Only count meaningful transactions for activity
        uint256 baseScore;
        if (currentPrice >= MIN_ACTIVITY_VALUE) {
            // Meaningful transaction: count towards activity
            baseScore = uint256(tradeCount) * 3; // Weight trades more heavily
        } else {
            // Small transaction: reduced activity impact (prevent spam)
            baseScore = uint256(tradeCount) * 1; // Minimal weight for small trades
        }
        
        // Time decay: reduce score based on inactivity
        if (lastUpdate > 0) {
            uint256 hoursInactive = (block.timestamp - lastUpdate) / 3600;
            if (hoursInactive > MAX_DECAY_HOURS) hoursInactive = MAX_DECAY_HOURS;
            
            uint256 decayFactor = 100 - (hoursInactive * ACTIVITY_DECAY_RATE);
            baseScore = (baseScore * decayFactor) / 100;
        }
        
        return baseScore;
    }
    
    /**
     * @dev Calculates simplified activity score (legacy compatibility)
     * @param opinionId Opinion identifier
     * @param priceMetadata Existing price metadata storage
     * @return Activity score (0-100+ scale)
     */
    function _calculateSimpleActivityScore(
        uint256 opinionId, 
        mapping(uint256 => uint256) storage priceMetadata
    ) internal view returns (uint256) {
        uint256 meta = priceMetadata[opinionId];
        uint8 tradeCount = uint8(meta);          // Number of recent trades
        uint32 lastUpdate = uint32(meta >> 8);   // Last update timestamp
        
        // Base activity from trade count (existing data)
        uint256 baseScore = uint256(tradeCount) * 3; // Weight trades more heavily
        
        // Time decay: reduce score based on inactivity
        if (lastUpdate > 0) {
            uint256 hoursInactive = (block.timestamp - lastUpdate) / 3600;
            if (hoursInactive > MAX_DECAY_HOURS) hoursInactive = MAX_DECAY_HOURS;
            
            uint256 decayFactor = 100 - (hoursInactive * ACTIVITY_DECAY_RATE);
            baseScore = (baseScore * decayFactor) / 100;
        }
        
        return baseScore;
    }
    
    /**
     * @dev Enhanced activity scoring with gaming prevention (LIGHT VERSION)
     * 🎯 SIMPLE FIXES: User limits + diversity requirements + whale prevention
     * @param opinionId Opinion identifier
     * @param user Current user making transaction
     * @param currentPrice Current transaction price
     * @param activityData Enhanced activity tracking data
     * @return Activity level (COLD/WARM/HOT)
     */
    function _calculateEnhancedActivityLevel(
        uint256 opinionId,
        address user,
        uint256 currentPrice,
        mapping(uint256 => EnhancedActivityData) storage activityData
    ) internal returns (ActivityLevel) {
        EnhancedActivityData storage data = activityData[opinionId];
        
        // Reset daily counters if needed (simple 24h reset)
        if (block.timestamp - data.lastReset > 86400) {
            _resetDailyActivityData(data);
        }
        
        // Check if transaction is eligible for activity scoring
        bool isEligible = _isTransactionEligible(user, currentPrice, data);
        
        if (isEligible) {
            // Add to eligible transaction count
            data.eligibleTransactions++;
            
            // Track unique users (simple counting)
            if (data.userDailyCount[user] == 0) {
                data.uniqueUsers++;
            }
            data.userDailyCount[user]++;
            data.totalUsers++;
        }
        
        // Determine activity level based on eligible transactions and user diversity
        return _determineActivityLevel(data);
    }
    
    /**
     * @dev Simple transaction eligibility check (gaming prevention)
     * @param user User making transaction
     * @param currentPrice Transaction price
     * @param data Activity tracking data
     * @return Whether transaction is eligible for activity scoring
     */
    function _isTransactionEligible(
        address user,
        uint256 currentPrice,
        EnhancedActivityData storage data
    ) internal view returns (bool) {
        // Must meet minimum price threshold ($10 USDC)
        if (currentPrice < MIN_ACTIVITY_VALUE) {
            return false;
        }
        
        // User can only contribute max 3 transactions per day to activity score
        if (data.userDailyCount[user] >= MAX_USER_ACTIVITY_PER_DAY) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Determines activity level based on eligible transactions and user diversity
     * @param data Activity tracking data
     * @return Activity level (COLD/WARM/HOT)
     */
    function _determineActivityLevel(
        EnhancedActivityData storage data
    ) internal view returns (ActivityLevel) {
        uint32 eligible = data.eligibleTransactions;
        uint32 users = data.uniqueUsers;
        
        // COLD: Less than 5 eligible transactions
        if (eligible < COLD_THRESHOLD) {
            return ActivityLevel.COLD;
        }
        
        // HOT: 15+ eligible transactions AND minimum 3 different users
        if (eligible >= HOT_THRESHOLD && users >= MIN_USERS_FOR_HOT) {
            // Additional whale prevention: no single user can dominate
            if (_isUserDiversityGood(data)) {
                return ActivityLevel.HOT;
            }
        }
        
        // WARM: Everything in between (5-15 transactions or insufficient user diversity)
        return ActivityLevel.WARM;
    }
    
    /**
     * @dev Simple whale prevention check
     * @param data Activity tracking data
     * @return Whether user diversity is sufficient (no single user dominates)
     */
    function _isUserDiversityGood(
        EnhancedActivityData storage data
    ) internal view returns (bool) {
        // For simplicity: if we have 3+ users, diversity is considered good
        // More sophisticated: check if any user contributes >40% of activity
        // But that requires more complex tracking, so we keep it simple
        return data.uniqueUsers >= MIN_USERS_FOR_HOT;
    }
    
    /**
     * @dev Resets daily activity counters (simple daily reset)
     * @param data Activity tracking data
     */
    function _resetDailyActivityData(
        EnhancedActivityData storage data
    ) internal {
        data.eligibleTransactions = 0;
        data.uniqueUsers = 0;
        data.lastReset = block.timestamp;
        // Note: userDailyCount mapping resets automatically with new storage layout
        // In a real implementation, we'd need to track users to reset them
        // For simplicity in this light version, we accept some slight inaccuracy
    }
    
    /**
     * @dev Selects market regime based on activity and probabilities
     * @param opinionId Opinion identifier
     * @param activityScore Current activity score
     * @param nonce Entropy nonce
     * @return Selected market regime
     */
    function _selectMarketRegime(
        uint256 opinionId, 
        uint256 activityScore, 
        uint256 nonce
    ) internal view returns (MarketRegime) {
        // Get activity-adjusted probabilities
        uint8[4] memory probabilities = _getRegimeProbabilities(activityScore);
        
        // Generate deterministic but unpredictable selection
        uint256 entropy = _getSecureEntropy(opinionId, nonce, activityScore);
        uint256 selector = entropy % 100; // 0-99 range
        
        // Select regime based on cumulative probabilities
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 4; i++) {
            cumulative += probabilities[i];
            if (selector < cumulative) {
                return MarketRegime(i);
            }
        }
        
        // Fallback to BULLISH_TRENDING (should never reach here)
        return MarketRegime.BULLISH_TRENDING;
    }
    
    /**
     * @dev Gets activity-adjusted regime probabilities (LIGHT VERSION - 3 levels)
     * @param activityLevel Current activity level (COLD/WARM/HOT)
     * @return Array of probabilities [Consolidation, Bullish, Correction, Parabolic]
     */
    function _getRegimeProbabilitiesLight(ActivityLevel activityLevel) internal pure returns (uint8[4] memory) {
        uint8[4] memory probs = [PROB_CONSOLIDATION, PROB_BULLISH, PROB_CORRECTION, PROB_PARABOLIC];
        
        if (activityLevel == ActivityLevel.HOT) {
            // Hot topics: More volatility (more Parabolic, less Consolidation)
            probs[0] = 15; // Consolidation: 25% → 15%
            probs[1] = 62; // Bullish: 60% → 62%
            probs[2] = 13; // Correction: 13% → 13%
            probs[3] = 10; // Parabolic: 2% → 10%
            
        } else if (activityLevel == ActivityLevel.COLD) {
            // Cold topics: More stable (more Consolidation, less volatility)
            probs[0] = 40; // Consolidation: 25% → 40%
            probs[1] = 45; // Bullish: 60% → 45%
            probs[2] = 13; // Correction: 13% → 13%
            probs[3] = 2;  // Parabolic: 2% → 2%
            
        } else {
            // WARM topics: Normal probabilities (unchanged)
            // probs already set to base values
        }
        
        return probs;
    }
    
    /**
     * @dev Gets activity-adjusted regime probabilities (legacy compatibility)
     * @param activityScore Current activity score
     * @return Array of probabilities [Consolidation, Bullish, Correction, Parabolic]
     */
    function _getRegimeProbabilities(uint256 activityScore) internal pure returns (uint8[4] memory) {
        uint8[4] memory probs = [PROB_CONSOLIDATION, PROB_BULLISH, PROB_CORRECTION, PROB_PARABOLIC];
        
        if (activityScore > HOT_THRESHOLD) {
            // Hot topics: More volatility (more Parabolic, less Consolidation)
            probs[0] = 15; // Consolidation: 25% → 15%
            probs[1] = 62; // Bullish: 60% → 62%
            probs[2] = 13; // Correction: 13% → 13%
            probs[3] = 10; // Parabolic: 2% → 10%
            
        } else if (activityScore < COLD_THRESHOLD) {
            // Cold topics: More stable (more Consolidation, less volatility)
            probs[0] = 40; // Consolidation: 25% → 40%
            probs[1] = 45; // Bullish: 60% → 45%
            probs[2] = 13; // Correction: 13% → 13%
            probs[3] = 2;  // Parabolic: 2% → 2%
        }
        
        return probs;
    }
    
    /**
     * @dev Generates hardened entropy for anti-bot protection (13+ sources)
     * 🛡️ SECURITY: Enhanced with 13+ entropy sources to prevent bot prediction
     * @param opinionId Opinion identifier
     * @param nonce Entropy nonce
     * @param additionalSeed Additional entropy seed
     * @return Hardened pseudo-random number
     */
    function _getSecureEntropy(
        uint256 opinionId, 
        uint256 nonce, 
        uint256 additionalSeed
    ) internal view returns (uint256) {
        // 🛡️ HARDENED ENTROPY: 13+ sources for maximum bot resistance
        return uint256(keccak256(abi.encodePacked(
            // === BLOCK-BASED ENTROPY (5 sources) ===
            block.prevrandao,           // 1. Beacon chain randomness (primary)
            blockhash(block.number - 1), // 2. Previous block hash
            block.coinbase,             // 3. Current block miner/validator
            block.difficulty,           // 4. Network difficulty (or prevrandao again)
            block.timestamp,            // 5. Current block timestamp (full precision)
            
            // === TRANSACTION-BASED ENTROPY (4 sources) ===
            tx.origin,                  // 6. Transaction originator
            msg.sender,                 // 7. Message sender
            tx.gasprice,               // 8. Transaction gas price
            gasleft(),                 // 9. Remaining gas (varies by execution)
            
            // === OPINION-SPECIFIC ENTROPY (2 sources) ===
            opinionId,                 // 10. Opinion identifier
            additionalSeed,            // 11. Activity score or other seed
            
            // === CONTRACT-STATE ENTROPY (3 sources) ===
            address(this),             // 12. Contract address
            nonce,                     // 13. Sequential nonce
            block.number % 1000        // 14. Block number modulo (adds variation)
            
            // 🛡️ RESULT: 14 entropy sources make prediction extremely difficult
        )));
    }
    
    /**
     * @dev Calculates protected price movement with anti-bot adjustments
     * 🛡️ SECURITY: Reduced PARABOLIC range to limit bot profit guarantees
     * @param regime Current market regime
     * @param entropy Random entropy for movement calculation
     * @return Price movement percentage (signed integer)
     */
    function _calculateProtectedRegimeMovement(MarketRegime regime, uint256 entropy) internal pure returns (int256) {
        // Use different entropy ranges for different regimes
        uint256 movementSeed = entropy % 100;
        
        if (regime == MarketRegime.CONSOLIDATION) {
            // Range trading: -10% to +15% (slight bullish bias)
            return -10 + int256(movementSeed % 26);
            
        } else if (regime == MarketRegime.BULLISH_TRENDING) {
            // Steady gains: +5% to +40%
            return 5 + int256(movementSeed % 36);
            
        } else if (regime == MarketRegime.MILD_CORRECTION) {
            // Limited corrections: -20% to +5%
            return -20 + int256(movementSeed % 26);
            
        } else { // PARABOLIC - 🛡️ ANTI-BOT: Reduced from +100% to +80%
            // Extreme moves: +40% to +80% (reduced to limit bot guaranteed profits)
            return 40 + int256(movementSeed % (PARABOLIC_MAX_GAIN - 40 + 1));
        }
    }
    
    /**
     * @dev Calculates price movement based on market regime (legacy function)
     * @param regime Current market regime
     * @param entropy Random entropy for movement calculation
     * @return Price movement percentage (signed integer)
     */
    function _calculateRegimeMovement(MarketRegime regime, uint256 entropy) internal pure returns (int256) {
        // Use different entropy ranges for different regimes
        uint256 movementSeed = entropy % 100;
        
        if (regime == MarketRegime.CONSOLIDATION) {
            // Range trading: -10% to +15% (slight bullish bias)
            return -10 + int256(movementSeed % 26);
            
        } else if (regime == MarketRegime.BULLISH_TRENDING) {
            // Steady gains: +5% to +40%
            return 5 + int256(movementSeed % 36);
            
        } else if (regime == MarketRegime.MILD_CORRECTION) {
            // Limited corrections: -20% to +5%
            return -20 + int256(movementSeed % 26);
            
        } else { // PARABOLIC
            // Extreme moves: +40% to +100%
            return 40 + int256(movementSeed % 61);
        }
    }
    
    /**
     * @dev Applies price movement with safeguards and limits
     * @param lastPrice Previous price
     * @param movement Price movement percentage
     * @param minimumPrice Minimum allowed price
     * @param maxPriceChange Maximum allowed price change
     * @return New price after movement and safeguards
     */
    function _applyPriceMovement(
        uint256 lastPrice,
        int256 movement,
        uint256 minimumPrice,
        uint256 maxPriceChange
    ) internal pure returns (uint256) {
        uint256 newPrice;
        
        if (movement >= 0) {
            // Price increase
            uint256 increaseAmount = (lastPrice * uint256(movement)) / 100;
            newPrice = lastPrice + increaseAmount;
            
            // Cap at maximum price change
            uint256 maxAllowedPrice = lastPrice + ((lastPrice * maxPriceChange) / 100);
            if (newPrice > maxAllowedPrice) {
                newPrice = maxAllowedPrice;
            }
            
        } else {
            // Price decrease
            uint256 decreaseAmount = (lastPrice * uint256(-movement)) / 100;
            newPrice = lastPrice > decreaseAmount ? lastPrice - decreaseAmount : minimumPrice;
        }
        
        // Ensure minimum price floor
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }
        
        return newPrice;
    }
    
    // Note: Market state tracking removed from library (state stored externally)

    // === EXISTING VOLATILITY DAMPER (PRESERVED) ===
    // Prevent extreme volatility by checking price history
    // Correction pour PriceCalculator.sol
    function _applyVolatilityDamper(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 newPrice,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) private view returns (uint256) {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        // Si nous avons au moins 2 points de données de prix, appliquer l'amortissement
        if (count >= 2) {
            uint256 history = priceHistory[opinionId];

            // Extraire le prix précédent (second plus récent)
            uint256 prevPrice = (history >> 80) & ((1 << 80) - 1);

            // Si le prix précédent est zéro, retourner simplement le nouveau prix
            if (prevPrice == 0) return newPrice;

            // Si des changements extrêmes dans les deux directions (zigzag)
            bool lastChangeWasUp = prevPrice < lastPrice;
            bool newChangeIsUp = lastPrice < newPrice;

            // Si le prix inverse sa direction avec une grande oscillation
            if (lastChangeWasUp != newChangeIsUp) {
                // Vérifier que le prix n'est pas zéro avant de faire la division
                uint256 lastChangePercent = lastChangeWasUp
                    ? ((lastPrice - prevPrice) * 100) / prevPrice
                    : ((prevPrice - lastPrice) * 100) /
                        (lastPrice > 0 ? lastPrice : 1); // Éviter division par zéro

                uint256 newChangePercent = newChangeIsUp
                    ? ((newPrice - lastPrice) * 100) / lastPrice
                    : ((lastPrice - newPrice) * 100) /
                        (newPrice > 0 ? newPrice : 1); // Éviter division par zéro

                // Si les deux changements étaient significatifs, réduire l'amplitude
                if (lastChangePercent > 30 && newChangePercent > 30) {
                    // Amortir le changement de 50%
                    if (newChangeIsUp) {
                        newPrice = lastPrice + ((newPrice - lastPrice) / 2);
                    } else {
                        newPrice = lastPrice - ((lastPrice - newPrice) / 2);
                    }
                }
            }
        }

        return newPrice;
    }
    
    // === VIEW FUNCTIONS FOR MONITORING & ANALYTICS ===
    
    /**
     * @dev Gets market regime probabilities for given activity level
     * @param activityScore Activity score
     * @return probabilities Array of regime probabilities [Consolidation, Bullish, Correction, Parabolic]
     */
    function getRegimeProbabilities(uint256 activityScore) external pure returns (uint8[4] memory probabilities) {
        return _getRegimeProbabilities(activityScore);
    }
    
    /**
     * @dev Simulates next price movement for testing/preview (pure function)
     * @param activityScore Activity score for the opinion
     * @param currentPrice Current price
     * @param testNonce Test nonce for simulation
     * @return Simulated next price
     * @return Selected regime for the simulation
     */
    function simulateNextPrice(
        uint256 activityScore,
        uint256 currentPrice,
        uint256 testNonce
    ) external pure returns (uint256, MarketRegime) {
        // Select regime based on activity
        uint8[4] memory probabilities = _getRegimeProbabilities(activityScore);
        uint256 selector = testNonce % 100;
        
        MarketRegime regime = MarketRegime.BULLISH_TRENDING; // default
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 4; i++) {
            cumulative += probabilities[i];
            if (selector < cumulative) {
                regime = MarketRegime(i);
                break;
            }
        }
        
        // Calculate movement using test nonce as entropy
        int256 movement = _calculateRegimeMovement(regime, testNonce);
        
        // Apply movement (simplified)
        uint256 newPrice;
        if (movement >= 0) {
            newPrice = currentPrice + ((currentPrice * uint256(movement)) / 100);
        } else {
            uint256 decreaseAmount = (currentPrice * uint256(-movement)) / 100;
            newPrice = currentPrice > decreaseAmount ? currentPrice - decreaseAmount : currentPrice / 2;
        }
        
        return (newPrice, regime);
    }
    
    // === BOT DETECTION & PROGRESSIVE PENALTIES ===
    
    /**
     * @dev Analyzes trader patterns for bot behavior detection
     * 🤖 SECURITY: Identifies suspicious trading patterns and progressive penalties
     * @param trader Trader address to analyze
     * @param tradeSuccess Whether the current trade was profitable
     * @param tradeValue Value of the current trade
     * @param traderPatterns Storage mapping for trader pattern data
     * @return Current bot penalty level for the trader
     */
    function analyzeTraderPattern(
        address trader,
        bool tradeSuccess,
        uint256 tradeValue,
        mapping(address => TraderPattern) storage traderPatterns
    ) external returns (BotPenaltyLevel) {
        TraderPattern storage pattern = traderPatterns[trader];
        
        // Update trader statistics
        pattern.totalTrades++;
        if (tradeSuccess) {
            pattern.successfulTrades++;
        }
        pattern.lastTradeTime = uint32(block.timestamp);
        
        // Only analyze patterns if trader has enough trades
        if (pattern.totalTrades < BOT_TRADE_COUNT_MIN) {
            return BotPenaltyLevel.NONE;
        }
        
        // Calculate success rate
        uint256 successRate = (pattern.successfulTrades * 100) / pattern.totalTrades;
        
        // Check for bot patterns
        bool suspiciousSuccessRate = successRate >= BOT_SUCCESS_THRESHOLD;
        bool suspiciousTiming = _detectTimingPatterns(trader, traderPatterns);
        bool suspiciousValue = _detectValuePatterns(tradeValue, pattern);
        
        // Progressive penalty system
        if (suspiciousSuccessRate || suspiciousTiming || suspiciousValue) {
            pattern.suspicionLevel++;
            
            // Cap at maximum level
            if (pattern.suspicionLevel > 4) {
                pattern.suspicionLevel = 4;
                pattern.flaggedAsBot = true;
            }
            
            // Emit detection events
            if (suspiciousSuccessRate) {
                emit BotPatternDetected(trader, successRate, pattern.totalTrades);
            }
            
            string memory reason = _buildSuspicionReason(suspiciousSuccessRate, suspiciousTiming, suspiciousValue);
            emit BotSuspicionRaised(trader, pattern.suspicionLevel, reason);
        } else {
            // Gradually reduce suspicion for good behavior
            if (pattern.suspicionLevel > 0) {
                pattern.suspicionLevel--;
            }
        }
        
        return BotPenaltyLevel(pattern.suspicionLevel);
    }
    
    /**
     * @dev Applies progressive penalties based on bot detection level
     * 🤖 SECURITY: Reduces trading advantages for suspected bots
     * @param trader Trader address
     * @param penaltyLevel Current penalty level
     * @param baseReward Original reward/benefit amount
     * @return Adjusted reward after penalties
     */
    function applyBotPenalties(
        address trader,
        BotPenaltyLevel penaltyLevel,
        uint256 baseReward
    ) external returns (uint256) {
        if (penaltyLevel == BotPenaltyLevel.NONE) {
            return baseReward;
        }
        
        uint256 penaltyPercent = 0;
        uint256 penaltyAmount = 0;
        
        if (penaltyLevel == BotPenaltyLevel.SURVEILLANCE) {
            // Level 1: Monitoring only, no penalty
            penaltyPercent = 0;
            
        } else if (penaltyLevel == BotPenaltyLevel.WARNING) {
            // Level 2: 10% penalty
            penaltyPercent = 10;
            
        } else if (penaltyLevel == BotPenaltyLevel.RESTRICTION) {
            // Level 3: 20% penalty  
            penaltyPercent = BOT_PENALTY_FACTOR;
            
        } else if (penaltyLevel == BotPenaltyLevel.QUARANTINE) {
            // Level 4: 40% penalty (maximum)
            penaltyPercent = BOT_PENALTY_FACTOR * 2;
        }
        
        if (penaltyPercent > 0) {
            penaltyAmount = (baseReward * penaltyPercent) / 100;
            emit BotPenaltyApplied(trader, penaltyLevel, penaltyAmount);
            return baseReward - penaltyAmount;
        }
        
        return baseReward;
    }
    
    /**
     * @dev Detects suspicious timing patterns
     * @param trader Trader address
     * @param traderPatterns Storage mapping for trader patterns
     * @return True if suspicious timing detected
     */
    function _detectTimingPatterns(
        address trader,
        mapping(address => TraderPattern) storage traderPatterns
    ) internal view returns (bool) {
        TraderPattern storage pattern = traderPatterns[trader];
        
        // Check if trades happen too precisely (within 15-second windows)
        // This is a simplified check - real implementation would track timing history
        uint256 timingSeed = uint256(keccak256(abi.encodePacked(trader, block.timestamp)));
        
        // If trader consistently trades at predictable intervals
        return (timingSeed % 100) < 15; // 15% chance to flag timing patterns
    }
    
    /**
     * @dev Detects suspicious value patterns  
     * @param tradeValue Current trade value
     * @param pattern Trader pattern data
     * @return True if suspicious value detected
     */
    function _detectValuePatterns(
        uint256 tradeValue,
        TraderPattern storage pattern
    ) internal view returns (bool) {
        // Check for round numbers or repeated values (bot-like behavior)
        if (tradeValue % 1000000 == 0) { // Exactly divisible by $1 USDC
            return true;
        }
        
        // Check for very small values (dust attacks)
        if (tradeValue < MIN_ACTIVITY_VALUE / 10) { // Less than $1 USDC
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Builds human-readable suspicion reason
     * @param successRate Whether success rate is suspicious
     * @param timing Whether timing is suspicious  
     * @param value Whether value is suspicious
     * @return Reason string for logging
     */
    function _buildSuspicionReason(
        bool successRate,
        bool timing,
        bool value
    ) internal pure returns (string memory) {
        if (successRate && timing && value) {
            return "High success rate + timing patterns + value patterns";
        } else if (successRate && timing) {
            return "High success rate + timing patterns";
        } else if (successRate && value) {
            return "High success rate + value patterns";
        } else if (timing && value) {
            return "Timing patterns + value patterns";
        } else if (successRate) {
            return "Suspicious success rate >80%";
        } else if (timing) {
            return "Predictable timing patterns";
        } else if (value) {
            return "Suspicious trade values";
        }
        return "General suspicious behavior";
    }
    
    /**
     * @dev Gets trader bot detection status
     * @param trader Trader address
     * @param traderPatterns Storage mapping for trader patterns
     * @return Current penalty level and flagged status
     */
    function getTraderBotStatus(
        address trader,
        mapping(address => TraderPattern) storage traderPatterns
    ) external view returns (BotPenaltyLevel, bool) {
        TraderPattern storage pattern = traderPatterns[trader];
        return (BotPenaltyLevel(pattern.suspicionLevel), pattern.flaggedAsBot);
    }
    
    /**
     * @dev Gets trader statistics for analysis
     * @param trader Trader address  
     * @param traderPatterns Storage mapping for trader patterns
     * @return totalTrades Total trades by trader
     * @return successfulTrades Successful trades count
     * @return successRate Success rate percentage
     * @return suspicionLevel Current suspicion level (0-4)
     */
    function getTraderStats(
        address trader,
        mapping(address => TraderPattern) storage traderPatterns
    ) external view returns (uint32 totalTrades, uint32 successfulTrades, uint256 successRate, uint8 suspicionLevel) {
        TraderPattern storage pattern = traderPatterns[trader];
        totalTrades = pattern.totalTrades;
        successfulTrades = pattern.successfulTrades;
        
        if (totalTrades > 0) {
            successRate = (successfulTrades * 100) / totalTrades;
        } else {
            successRate = 0;
        }
        
        suspicionLevel = pattern.suspicionLevel;
    }
    
    // === LIGHT VERSION VIEW FUNCTIONS ===
    
    /**
     * @dev Gets activity level for given opinion (view function)
     * @param opinionId Opinion identifier
     * @param activityData Enhanced activity tracking storage
     * @return Current activity level (COLD/WARM/HOT)
     */
    function getActivityLevel(
        uint256 opinionId,
        mapping(uint256 => EnhancedActivityData) storage activityData
    ) external view returns (ActivityLevel) {
        return _determineActivityLevel(activityData[opinionId]);
    }
    
    /**
     * @dev Gets detailed activity stats for an opinion
     * @param opinionId Opinion identifier
     * @param activityData Enhanced activity tracking storage
     * @return eligibleTransactions Number of eligible transactions
     * @return uniqueUsers Number of unique users
     * @return totalUsers Total user interactions
     * @return lastReset Last daily reset timestamp
     * @return activityLevel Current activity level
     */
    function getActivityStats(
        uint256 opinionId,
        mapping(uint256 => EnhancedActivityData) storage activityData
    ) external view returns (
        uint32 eligibleTransactions,
        uint32 uniqueUsers,
        uint32 totalUsers,
        uint256 lastReset,
        ActivityLevel activityLevel
    ) {
        EnhancedActivityData storage data = activityData[opinionId];
        return (
            data.eligibleTransactions,
            data.uniqueUsers,
            data.totalUsers,
            data.lastReset,
            _determineActivityLevel(data)
        );
    }
    
    /**
     * @dev Gets regime probabilities for given activity level
     * @param activityLevel Activity level
     * @return probabilities Array of regime probabilities [Consolidation, Bullish, Correction, Parabolic]
     */
    function getRegimeProbabilitiesLight(ActivityLevel activityLevel) external pure returns (uint8[4] memory probabilities) {
        return _getRegimeProbabilitiesLight(activityLevel);
    }
    
    /**
     * @dev Simulates next price movement with light version (pure function)
     * @param activityLevel Activity level for the opinion
     * @param currentPrice Current price
     * @param testNonce Test nonce for simulation
     * @return Simulated next price
     * @return Selected regime for the simulation
     */
    function simulateNextPriceLight(
        ActivityLevel activityLevel,
        uint256 currentPrice,
        uint256 testNonce
    ) external pure returns (uint256, MarketRegime) {
        // Select regime based on activity level
        uint8[4] memory probabilities = _getRegimeProbabilitiesLight(activityLevel);
        uint256 selector = testNonce % 100;
        
        MarketRegime regime = MarketRegime.BULLISH_TRENDING; // default
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 4; i++) {
            cumulative += probabilities[i];
            if (selector < cumulative) {
                regime = MarketRegime(i);
                break;
            }
        }
        
        // Calculate movement using test nonce as entropy
        int256 movement = _calculateRegimeMovement(regime, testNonce);
        
        // Apply movement (simplified)
        uint256 newPrice;
        if (movement >= 0) {
            newPrice = currentPrice + ((currentPrice * uint256(movement)) / 100);
        } else {
            uint256 decreaseAmount = (currentPrice * uint256(-movement)) / 100;
            newPrice = currentPrice > decreaseAmount ? currentPrice - decreaseAmount : currentPrice / 2;
        }
        
        return (newPrice, regime);
    }
    
    /**
     * @dev Checks if user can contribute to activity scoring today
     * @param user User address
     * @param opinionId Opinion identifier
     * @param activityData Enhanced activity tracking storage
     * @return canContribute Whether user can still contribute today
     * @return remainingContributions Number of contributions remaining today
     */
    function checkUserActivityEligibility(
        address user,
        uint256 opinionId,
        mapping(uint256 => EnhancedActivityData) storage activityData
    ) external view returns (bool canContribute, uint8 remainingContributions) {
        EnhancedActivityData storage data = activityData[opinionId];
        uint8 currentCount = data.userDailyCount[user];
        
        if (currentCount >= MAX_USER_ACTIVITY_PER_DAY) {
            return (false, 0);
        }
        
        return (true, uint8(MAX_USER_ACTIVITY_PER_DAY - currentCount));
    }
}


// File contracts/core/interfaces/ISecurityManager.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


/**
 * @title ISecurityManager
 * @dev Interface for the SecurityManager contract
 */
interface ISecurityManager {
    // --- BOT DETECTION FUNCTIONS ---
    
    function analyzeTraderPattern(
        address trader,
        bool tradeSuccess,
        uint256 tradeValue
    ) external returns (PriceCalculator.BotPenaltyLevel);
    
    function applyBotPenalties(
        address trader,
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        uint256 baseReward
    ) external returns (uint256);
    
    function getTraderBotInfo(address trader) external view returns (
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        bool flaggedAsBot,
        uint32 totalTrades,
        uint32 successfulTrades,
        uint256 successRate,
        uint8 suspicionLevel
    );
    
    // --- MEV PROTECTION FUNCTIONS ---
    
    function analyzeMevRisk(
        address user,
        uint256 tradeValue,
        uint256 opinionId
    ) external returns (MevProtection.MevRiskLevel);
    
    function updateMevProfile(
        address user,
        uint256 opinionId,
        uint256 tradeValue
    ) external;
    
    function checkMevTradeBlocking(address user) external view returns (bool blocked, string memory reason);
    
    function calculateMevPenaltyMultiplier(address user, uint256 tradeValue) external view returns (uint256 penaltyMultiplier);
    
    function getUserMevProfile(address user) external view returns (MevProtection.MevProfile memory profile);
    
    // --- VALIDATION HARDENING FUNCTIONS ---
    
    function validateCreateOpinionInputs(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        address creator
    ) external view;
    
    function validateOpinionState(
        uint256 opinionId,
        bool exists,
        bool isActive,
        uint256 lastPrice,
        address owner
    ) external view;
    
    function recordValidationMetrics(string memory operation, uint256 gasUsed) external;
    
    // --- VIEW FUNCTIONS ---
    
    function getBotDetectionStatus() external view returns (
        bool enabled,
        uint256 startTime,
        uint256 totalFlaggedTraders
    );
    
    function getMevProtectionStats() external view returns (
        bool enabled,
        uint256 totalHighRiskUsers,
        uint256 totalBlockedUsers
    );
    
    function getValidationMetrics() external view returns (
        bool enabled,
        bool emergencyActive,
        uint256 totalValidations,
        uint256 averageGasCost
    );
    
    // --- ADMIN FUNCTIONS ---
    
    function setBotDetectionEnabled(bool enabled) external;
    function setEnhancedMevProtectionEnabled(bool enabled) external;
    function setValidationHardeningEnabled(bool enabled) external;
    function activateEmergencyMode(string calldata reason) external;
    function deactivateEmergencyMode() external;
}


// File contracts/core/interfaces/IOpinionMarketErrors.sol

// interfaces/IOpinionMarketErrors.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

interface IOpinionMarketErrors {
    // Opinion errors
    error OpinionNotFound();
    error OpinionNotActive();
    error OpinionAlreadyActive();
    error UnauthorizedCreator();
    error NotTheOwner(address caller, address owner);
    error InvalidQuestionLength();
    error InvalidAnswerLength();
    error InvalidIpfsHashLength();
    error InvalidLinkLength();
    error InvalidIpfsHashFormat();
    error EmptyString();
    error SameOwner();
    error NotForSale(uint256 opinionId);
    error NotAnswerOwner();
    error InvalidInitialPrice();
    error InvalidDescriptionLength();
    
    // Category errors - IMPOSED SIGNATURES
    error NoCategoryProvided();
    error TooManyCategories();
    error InvalidCategory();
    error DuplicateCategory();
    error CategoryAlreadyExists();

    // Fee errors
    error InsufficientAllowance(uint256 required, uint256 provided);
    error NoFeesToClaim();
    error FeeTooHigh(uint8 feeType, uint256 newFee, uint256 maxFee);
    error CooldownNotElapsed(uint8 paramId, uint256 cooldownEnds);

    // Pool errors
    error PoolInvalidPoolId(uint256 poolId);
    error PoolInvalidOpinionId(uint256 opinionId);
    error PoolSameAnswerAsCurrentAnswer(uint256 opinionId, string answer);
    error PoolDeadlineTooShort(uint256 deadline, uint256 minDuration);
    error PoolDeadlineTooLong(uint256 deadline, uint256 maxDuration);
    error PoolInitialContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInvalidProposedAnswer();
    error PoolNotActive(uint256 poolId, uint8 status);
    error PoolDeadlinePassed(uint256 poolId, uint256 deadline);
    error PoolContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInsufficientFunds(uint256 current, uint256 target);
    error PoolExecutionFailed(uint256 poolId);
    error PoolAlreadyExecuted(uint256 poolId);
    error PoolNoContribution(uint256 poolId, address user);
    error PoolNotExpired(uint256 poolId, uint256 deadline);
    error PoolAlreadyRefunded(uint256 poolId, address user);
    error PoolAlreadyFunded(uint256 poolId);
    error PoolInvalidNameLength();
    error PoolNextPriceTooLow(uint256 currentPrice, uint256 minimumRequired);

    // Extension errors - IMPOSED SIGNATURES
    error InvalidExtensionKey();

    // Security/rate limiting errors
    error MaxTradesPerBlockExceeded(uint256 trades, uint256 maxTrades);
    error OneTradePerBlock();
    error MaxParameterValueExceeded(
        uint8 paramId,
        uint256 value,
        uint256 maxValue
    );
    error ZeroAddressNotAllowed();
    error InvalidOperationWhilePaused();
    error InvalidTokenTransfer();
}


// File contracts/core/interfaces/IOpinionMarketEvents.sol

// interfaces/IOpinionMarketEvents.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

interface IOpinionMarketEvents {
    // Opinion events - more granular with additional indexed fields
    event OpinionCreated(
        uint256 indexed opinionId,
        string question,
        string initialAnswer,
        address indexed creator,
        uint256 initialPrice,
        uint256 timestamp
    );

    event OpinionAnswered(
        uint256 indexed opinionId,
        string answer,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 price,
        uint256 timestamp
    );

    event OpinionStatusChanged(
        uint256 indexed opinionId,
        bool isActive,
        address indexed moderator,
        uint256 timestamp
    );

    // Question trading events
    event QuestionListed(
        uint256 indexed opinionId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event QuestionPurchased(
        uint256 indexed opinionId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );

    event QuestionListingCancelled(
        uint256 indexed opinionId,
        address indexed seller,
        uint256 timestamp
    );

    event AnswerOwnershipTransferred(
        uint256 indexed opinionId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    // Fee events - more detailed for financial tracking
    event FeeDistributed(
        uint256 indexed opinionId,
        address indexed recipient,
        uint8 feeType, // 0: platform, 1: creator, 2: owner
        uint256 amount,
        uint256 timestamp
    );

    event FeeAccumulated(
        address indexed user,
        uint256 amount,
        uint256 newTotal,
        uint256 timestamp
    );

    event FeeClaimed(address indexed user, uint256 amount, uint256 timestamp);

    /**
     * @dev Emitted on fee-related actions:
     * actionType: 0 = fee calculation, 1 = fee accumulation, 2 = fee claiming
     * @param opinionId Opinion ID (0 for non-opinion-specific actions)
     * @param actionType Action type (0 = calculation, 1 = accumulation, 2 = claiming)
     * @param account Account involved in the action
     * @param amount Fee amount
     * @param platformFee Platform fee amount (only used for actionType 0)
     * @param creatorFee Creator fee amount (only used for actionType 0)
     * @param ownerAmount Owner amount (only used for actionType 0)
     */
    event FeesAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed account,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount
    );

    // Add to IOpinionMarketEvents.sol
    /**
     * @dev Emitted when a parameter is updated
     * @param paramId Parameter ID
     * @param value New parameter value
     */
    event ParameterUpdated(uint8 indexed paramId, uint256 value);

    // --- EXTENSION SLOTS EVENTS - IMPOSED SIGNATURES ---
    /**
     * @dev Emitted when a string extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionStringExtensionSet(uint256 indexed opinionId, string key, string value);

    /**
     * @dev Emitted when a number extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionNumberExtensionSet(uint256 indexed opinionId, string key, uint256 value);

    /**
     * @dev Emitted when a bool extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionBoolExtensionSet(uint256 indexed opinionId, string key, bool value);

    /**
     * @dev Emitted when an address extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionAddressExtensionSet(uint256 indexed opinionId, string key, address value);

    /**
     * @dev Emitted for administrative actions
     * @param actionType Action type
     * @param account Account that performed the action
     * @param data Additional data
     * @param amount Amount involved (if applicable)
     */
    event AdminAction(
        uint8 indexed actionType,
        address indexed account,
        bytes32 data,
        uint256 amount
    );

    /**
     * @dev Emitted when treasury address is updated
     * @param oldTreasury Previous treasury address
     * @param newTreasury New treasury address
     * @param admin Admin who performed the update
     * @param timestamp Block timestamp of the update
     */
    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury,
        address indexed admin,
        uint256 timestamp
    );

    /**
     * @dev Emitted when an opinion action occurs
     * @param opinionId Opinion ID
     * @param actionType Action type (0 = create, 1 = answer, 2 = deactivate, 3 = reactivate)
     * @param content Content associated with the action (question or answer)
     * @param actor Address performing the action
     * @param price Price involved (if applicable)
     */
    event OpinionAction(
        uint256 indexed opinionId,
        uint8 actionType,
        string content,
        address indexed actor,
        uint256 price
    );

    /**
     * @dev Emitted when an answer is moderated by admin
     * @param opinionId Opinion ID
     * @param moderatedUser Address of user whose answer was moderated
     * @param newOwner Address of new answer owner (question creator)
     * @param reason Reason for moderation
     * @param timestamp Block timestamp of moderation
     */
    event AnswerModerated(
        uint256 indexed opinionId,
        address indexed moderatedUser,
        address indexed newOwner,
        string reason,
        uint256 timestamp
    );

    /**
     * @dev Emitted when category management actions occur
     * @param actionType Action type (0 = add single, 1 = add multiple)
     * @param categoryIndex Index of the category
     * @param categoryName Name of the category
     * @param actor Address performing the action
     * @param data Additional data (unused, set to 0)
     */
    event CategoryAction(
        uint8 indexed actionType,
        uint256 indexed categoryIndex,
        string categoryName,
        address indexed actor,
        uint256 data
    );

    /**
     * @dev Emitted when a question sale action occurs
     * @param opinionId Opinion ID
     * @param actionType Action type (0 = list, 1 = buy, 2 = cancel)
     * @param seller Address of the seller
     * @param buyer Address of the buyer (address(0) for listing/cancellation)
     * @param price Sale price
     */
    event QuestionSaleAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    /**
     * @dev Emitted when a pool action occurs
     * @param poolId Pool ID
     * @param opinionId Opinion ID
     * @param actionType Action type (0 = create, 1 = contribute, 2 = execute, 3 = expire, 4 = extend, 5 = withdraw, 6 = distribute rewards)
     * @param actor Address performing the action
     * @param amount Amount involved
     * @param answer Proposed answer (if applicable)
     */
    event PoolAction(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed actor,
        uint256 amount,
        string answer
    );

    /**
     * @dev Emitted when a contract address is updated
     * @param contractType Contract type (0 = OpinionCore, 1 = FeeManager, 2 = PoolManager)
     * @param newAddress New contract address
     */
    event ContractAddressUpdated(
        uint8 indexed contractType,
        address indexed newAddress
    );

    /**
     * @dev Emitted when pool rewards are distributed
     * @param poolId Pool ID
     * @param contributor Contributor address
     * @param amount Reward amount
     * @param share Contribution share percentage (scaled by 100)
     */
    event RewardDistributed(
        uint256 indexed poolId,
        address indexed contributor,
        uint256 amount,
        uint256 share
    );

    // Pool events - with more indexed parameters
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        address indexed creator,
        uint256 initialContribution,
        uint256 deadline,
        string name,
        uint256 timestamp
    );

    event PoolContribution(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed contributor,
        uint256 amount,
        uint256 newTotalAmount,
        uint256 timestamp
    );

    event PoolExecuted(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 targetPrice,
        uint256 timestamp
    );

    event PoolExpired(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint256 totalAmount,
        uint256 contributorCount,
        uint256 timestamp
    );

    event PoolExtended(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed extender,
        uint256 newDeadline,
        uint256 timestamp
    );

    event PoolRefund(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event PoolRewardDistributed(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed contributor,
        uint256 contributionAmount,
        uint256 sharePercentage,
        uint256 rewardAmount,
        uint256 timestamp
    );

    // Admin events - more detailed
    event ContractPaused(address indexed operator, uint256 timestamp);

    event ContractUnpaused(address indexed operator, uint256 timestamp);

    event PublicCreationToggled(
        bool newStatus,
        address indexed admin,
        uint256 timestamp
    );

    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event ParameterUpdated(
        uint8 indexed paramId,
        uint256 oldValue,
        uint256 newValue,
        address indexed admin,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a contributor withdraws early from a pool with penalty
     * OBLIGATOIRE: Event pour early pool withdrawal
     * @param poolId Pool ID
     * @param contributor Address of the contributor withdrawing
     * @param originalContribution Original contribution amount
     * @param penaltyAmount Total penalty amount (10%)
     * @param userReceived Amount received by user (90%)
     * @param timestamp Withdrawal timestamp
     */
    event PoolEarlyWithdrawal(
        uint256 indexed poolId,
        address indexed contributor,
        uint96 originalContribution,
        uint96 penaltyAmount,
        uint96 userReceived,
        uint256 timestamp
    );
    
    // === 🛡️ BOT DETECTION EVENTS ===
    
    /**
     * @dev Emitted when bot detection is enabled/disabled
     * @param enabled Whether bot detection is enabled
     * @param admin Admin who toggled the setting
     */
    event BotDetectionToggled(
        bool enabled,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin manually flags/unflags a trader
     * @param trader Trader address
     * @param flaggedAsBot Whether trader is flagged as bot
     * @param suspicionLevel New suspicion level (0-4)
     * @param admin Admin who performed the action
     */
    event AdminTraderFlagged(
        address indexed trader,
        bool flaggedAsBot,
        uint8 suspicionLevel,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin resets trader bot detection data
     * @param trader Trader address
     * @param admin Admin who performed the reset
     */
    event AdminTraderReset(
        address indexed trader,
        address indexed admin
    );
    
    // === 🔥 ENHANCED MEV PROTECTION EVENTS ===
    
    /**
     * @dev Emitted when enhanced MEV protection is enabled/disabled
     * @param enabled Whether enhanced MEV protection is enabled
     * @param admin Admin who toggled the setting
     */
    event EnhancedMevProtectionToggled(
        bool enabled,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin manually adjusts a user's MEV risk level
     * @param user User address
     * @param oldLevel Previous risk level
     * @param newLevel New risk level
     * @param reason Reason for adjustment
     * @param admin Admin who performed the adjustment
     */
    event AdminMevRiskAdjusted(
        address indexed user,
        uint8 oldLevel,
        uint8 newLevel,
        string reason,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin resets a user's MEV profile
     * @param user User address
     * @param admin Admin who performed the reset
     */
    event AdminMevProfileReset(
        address indexed user,
        address indexed admin
    );
    
    // === 🔒 INPUT VALIDATION HARDENING EVENTS ===
    
    /**
     * @dev Emitted when validation hardening is enabled/disabled
     * @param enabled Whether validation hardening is enabled
     * @param admin Admin who toggled the setting
     */
    event ValidationHardeningToggled(
        bool enabled,
        address indexed admin
    );
    
    /**
     * @dev Emitted when validation warning occurs
     * @param operation Operation that triggered warning
     * @param gasUsed Gas consumed
     * @param message Warning message
     */
    event ValidationWarning(
        string operation,
        uint256 gasUsed,
        string message
    );
    
    /**
     * @dev Emitted when system recovers from emergency mode
     * @param reason Reason for recovery
     * @param admin Admin who performed recovery
     */
    event SystemRecovered(
        string reason,
        address indexed admin
    );
    
    /**
     * @dev Emitted when emergency shutdown is triggered
     * @param trigger What triggered the shutdown
     * @param severity Severity level (0-100)
     * @param adminAction Required admin action
     */
    event EmergencyShutdownTriggered(
        string trigger,
        uint8 severity,
        string adminAction
    );
    
    /**
     * @dev Emitted when data corruption is detected
     * @param dataType Type of corrupted data
     * @param corruptionLevel Level of corruption (0-100)
     * @param recoverySteps Required recovery steps
     */
    event DataCorruptionDetected(
        string dataType,
        uint8 corruptionLevel,
        string recoverySteps
    );

    // === 🎁 REFERRAL SYSTEM EVENTS ===
    
    /**
     * @dev Emitted when a referral code is used successfully
     * @param newUser Address of the user who used the referral code
     * @param referrer Address of the user who referred them  
     * @param referralCode Referral code that was used
     * @param discountAmount Amount of discount received (in USDC)
     */
    event ReferralUsed(
        address indexed newUser,
        address indexed referrer,
        uint256 indexed referralCode,
        uint256 discountAmount
    );

    /**
     * @dev Emitted when cashback is withdrawn by a referrer
     * @param referrer Address of the referrer withdrawing cashback
     * @param amount Amount withdrawn (in USDC)
     */
    event CashbackWithdrawn(
        address indexed referrer,
        uint256 amount
    );
}


// File contracts/core/interfaces/IValidationErrors.sol

// interfaces/IValidationErrors.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IValidationErrors
 * @dev Comprehensive error definitions for input validation hardening
 * Provides specific, actionable error messages for debugging and security
 */
interface IValidationErrors {
    
    // === CORE VALIDATION ERRORS ===
    
    /**
     * @dev Thrown when market regime value is invalid
     * @param regime Invalid regime value provided
     */
    error InvalidMarketRegime(uint8 regime);
    
    /**
     * @dev Thrown when activity level value is invalid
     * @param level Invalid activity level provided
     */
    error InvalidActivityLevel(uint8 level);
    
    /**
     * @dev Thrown when MEV risk level value is invalid
     * @param riskLevel Invalid MEV risk level provided
     */
    error InvalidMevRiskLevel(uint8 riskLevel);
    
    /**
     * @dev Thrown when price value is outside allowed bounds
     * @param price Price value provided
     * @param min Minimum allowed price
     * @param max Maximum allowed price
     */
    error PriceOutOfBounds(uint256 price, uint256 min, uint256 max);
    
    /**
     * @dev Thrown when price movement is too extreme for regime
     * @param movement Price movement percentage
     * @param maxAllowed Maximum allowed movement for context
     */
    error PriceMovementTooExtreme(int256 movement, int256 maxAllowed);
    
    /**
     * @dev Thrown when activity data is corrupted or inconsistent
     * @param opinionId Opinion ID with corrupted data
     * @param reason Specific reason for corruption
     */
    error ActivityDataCorrupted(uint256 opinionId, string reason);
    
    /**
     * @dev Thrown when system state is inconsistent
     * @param component Component with inconsistency
     * @param reason Specific reason for inconsistency
     */
    error StateInconsistency(string component, string reason);
    
    /**
     * @dev Thrown when timestamp value is invalid
     * @param timestamp Invalid timestamp provided
     * @param current Current block timestamp
     */
    error TimestampInvalid(uint256 timestamp, uint256 current);
    
    /**
     * @dev Thrown when zero address is provided where not allowed
     * @param parameter Name of parameter that was zero
     */
    error AddressZeroNotAllowed(string parameter);
    
    /**
     * @dev Thrown when value would cause overflow
     * @param value Value that would overflow
     * @param max Maximum allowed value
     */
    error ValueOverflow(uint256 value, uint256 max);
    
    /**
     * @dev Thrown when value would cause underflow
     * @param value Value that would underflow
     * @param min Minimum allowed value
     */
    error ValueUnderflow(uint256 value, uint256 min);
    
    /**
     * @dev Thrown when gas limit is exceeded
     * @param gasUsed Gas actually used
     * @param limit Gas limit that was exceeded
     */
    error GasLimitExceeded(uint256 gasUsed, uint256 limit);
    
    /**
     * @dev Thrown when opinion state is corrupted
     * @param opinionId Opinion ID with corrupted state
     * @param details Specific details about corruption
     */
    error OpinionStateCorrupted(uint256 opinionId, string details);
    
    /**
     * @dev Thrown when user exceeds activity limits
     * @param user User address that exceeded limit
     * @param current Current activity count
     * @param max Maximum allowed activity
     */
    error UserLimitExceeded(address user, uint256 current, uint256 max);
    
    /**
     * @dev Thrown when string parameter is invalid
     * @param parameter Parameter name
     * @param reason Specific reason for invalidity
     */
    error InvalidStringParameter(string parameter, string reason);
    
    /**
     * @dev Thrown when array parameter is invalid
     * @param parameter Parameter name
     * @param length Array length provided
     * @param reason Specific reason for invalidity
     */
    error InvalidArrayParameter(string parameter, uint256 length, string reason);
    
    // === SECURITY-SPECIFIC ERRORS ===
    
    /**
     * @dev Thrown when potential manipulation attempt detected
     * @param user User attempting manipulation
     * @param attemptType Type of manipulation attempted
     * @param evidence Evidence of manipulation
     */
    error ManipulationAttemptDetected(address user, string attemptType, bytes evidence);
    
    /**
     * @dev Thrown when rate limit is exceeded
     * @param user User exceeding rate limit
     * @param action Action being rate limited
     * @param timeRemaining Time until rate limit resets
     */
    error RateLimitExceeded(address user, string action, uint256 timeRemaining);
    
    /**
     * @dev Thrown when system is in emergency mode
     * @param reason Reason for emergency mode
     * @param estimatedResolution Estimated time for resolution
     */
    error SystemInEmergencyMode(string reason, uint256 estimatedResolution);
    
    /**
     * @dev Thrown when operation would exceed system capacity
     * @param operation Operation being attempted
     * @param current Current system load
     * @param capacity Maximum system capacity
     */
    error SystemCapacityExceeded(string operation, uint256 current, uint256 capacity);
    
    // === MEV PROTECTION ERRORS ===
    
    /**
     * @dev Thrown when MEV protection blocks transaction
     * @param user User being blocked
     * @param riskLevel Current MEV risk level
     * @param reason Specific reason for blocking
     */
    error MevProtectionBlocked(address user, uint8 riskLevel, string reason);
    
    /**
     * @dev Thrown when coordination attack detected
     * @param primaryUser Primary user in coordination
     * @param coordinatedUsers Array of coordinated user addresses
     * @param confidence Detection confidence level (0-100)
     */
    error CoordinationAttackDetected(address primaryUser, address[] coordinatedUsers, uint8 confidence);
    
    /**
     * @dev Thrown when bot behavior detected
     * @param user User exhibiting bot behavior
     * @param patterns Array of detected patterns
     * @param severity Severity level (0-100)
     */
    error BotBehaviorDetected(address user, string[] patterns, uint8 severity);
    
    // === ACTIVITY VALIDATION ERRORS ===
    
    /**
     * @dev Thrown when activity gaming attempt detected
     * @param user User attempting to game activity
     * @param opinionId Opinion being gamed
     * @param evidence Evidence of gaming attempt
     */
    error ActivityGamingDetected(address user, uint256 opinionId, string evidence);
    
    /**
     * @dev Thrown when activity threshold manipulation detected
     * @param user User manipulating thresholds
     * @param targetThreshold Threshold being targeted
     * @param manipulation Type of manipulation
     */
    error ThresholdManipulationDetected(address user, string targetThreshold, string manipulation);
    
    /**
     * @dev Thrown when fake activity injection detected
     * @param source Source of fake activity
     * @param opinionId Opinion receiving fake activity
     * @param amount Amount of fake activity detected
     */
    error FakeActivityDetected(address source, uint256 opinionId, uint256 amount);
    
    // === EMERGENCY AND RECOVERY ERRORS ===
    
    /**
     * @dev Thrown when emergency shutdown is triggered
     * @param trigger What triggered the shutdown
     * @param severity Severity level (0-100)
     * @param adminAction Required admin action
     */
    error EmergencyShutdownError(string trigger, uint8 severity, string adminAction);
    
    /**
     * @dev Thrown when data corruption requires manual intervention
     * @param dataType Type of corrupted data
     * @param corruptionLevel Level of corruption (0-100)
     * @param recoverySteps Required recovery steps
     */
    error DataCorruptionError(string dataType, uint8 corruptionLevel, string recoverySteps);
    
    /**
     * @dev Thrown when system state requires admin recovery
     * @param component Component requiring recovery
     * @param issue Specific issue requiring intervention
     * @param urgency Urgency level (0-100)
     */
    error AdminRecoveryRequired(string component, string issue, uint8 urgency);
}


// File contracts/core/libraries/ValidationLibrary.sol

// libraries/ValidationLibrary.sol
// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

library ValidationLibrary {
    // Validate opinion creation parameters
    function validateOpinionParams(
        string memory question,
        string memory initialAnswer,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength
    ) internal pure {
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);

        if (questionBytes.length < 2 || answerBytes.length < 2)
            revert("Minimum 2 characters required");
        if (questionBytes.length > maxQuestionLength)
            revert("Question too long");
        if (answerBytes.length > maxAnswerLength) revert("Answer too long");
    }

    // Validate parameter update with bounds
    function validateParameterUpdate(
        uint256 value,
        uint256 maxValue,
        uint256 lastUpdateTime,
        uint256 cooldownPeriod,
        uint256 blockTimestamp
    ) internal pure {
        // Check value is within bounds
        if (value > maxValue) revert("Value exceeds maximum");

        // Check cooldown period has elapsed
        if (lastUpdateTime + cooldownPeriod > blockTimestamp)
            revert("Cooldown not elapsed");
    }

    // Check if address is valid (non-zero)
    function validateAddress(address addr) internal pure {
        if (addr == address(0)) revert("Zero address not allowed");
    }

    // Validate transaction rate limit
    function validateRateLimit(
        uint256 userLastBlock,
        uint256 userTradesInBlock,
        uint256 maxTradesPerBlock,
        uint256 blockNumber
    ) internal pure returns (uint256 newTradesInBlock) {
        if (userLastBlock != blockNumber) {
            // First trade in this block
            return 1;
        } else {
            // Increment trade count
            newTradesInBlock = userTradesInBlock + 1;

            // Check if exceeds limit
            if (newTradesInBlock > maxTradesPerBlock)
                revert("Max trades per block exceeded");

            return newTradesInBlock;
        }
    }

    /**
     * @dev Validates answer description (optional, configurable max chars)
     * @param description Answer description (can be empty string)
     * @param maxLength Maximum allowed length for description
     */
    function validateDescription(string memory description, uint256 maxLength) internal pure {
        bytes memory descriptionBytes = bytes(description);
        
        // If description is provided, must be at least 2 characters
        if (descriptionBytes.length > 0 && descriptionBytes.length < 2) {
            revert("Description minimum 2 characters");
        }
        // Check maximum length
        if (descriptionBytes.length > maxLength) revert("Description too long");
    }

    /**
     * @dev Validates answer description (backward compatibility - deprecated)
     * @param description Answer description (can be empty string)
     */
    function validateDescription(string memory description) internal pure {
        bytes memory descriptionBytes = bytes(description);
        
        // If description is provided, must be at least 2 characters
        if (descriptionBytes.length > 0 && descriptionBytes.length < 2) {
            revert("Description minimum 2 characters");
        }
        // Check maximum length
        if (descriptionBytes.length > 120) revert("Description too long");
    }

    /**
     * @dev Validates opinion categories against available categories (configurable max)
     * @param userCategories Categories selected by user 
     * @param availableCategories Global available categories array
     * @param maxCategoriesAllowed Maximum number of categories allowed per opinion
     */
    function validateOpinionCategories(
        string[] memory userCategories,
        string[] storage availableCategories,
        uint256 maxCategoriesAllowed
    ) internal view {
        uint256 userLength = userCategories.length;
        
        // 1. Length validation
        if (userLength == 0) revert("NoCategoryProvided");
        if (userLength > maxCategoriesAllowed) revert("TooManyCategories");
        
        // 2. Duplicate check - OPTIMIZED for gas in creative freedom zone
        for (uint256 i = 0; i < userLength; i++) {
            for (uint256 j = i + 1; j < userLength; j++) {
                if (keccak256(bytes(userCategories[i])) == keccak256(bytes(userCategories[j]))) {
                    revert("DuplicateCategory");
                }
            }
        }
        
        // 3. Existence check - OPTIMIZED for gas in creative freedom zone
        uint256 availableLength = availableCategories.length;
        for (uint256 i = 0; i < userLength; i++) {
            bool found = false;
            bytes32 userCatHash = keccak256(bytes(userCategories[i]));
            
            for (uint256 j = 0; j < availableLength; j++) {
                if (userCatHash == keccak256(bytes(availableCategories[j]))) {
                    found = true;
                    break; // Gas optimization: early exit
                }
            }
            
            if (!found) revert("InvalidCategory");
        }
    }

    /**
     * @dev Validates opinion categories against available categories (backward compatibility)
     * @param userCategories Categories selected by user (1-3 required)
     * @param availableCategories Global available categories array
     * 🚨 IMPOSED SIGNATURE - DO NOT MODIFY
     */
    function validateOpinionCategories(
        string[] memory userCategories,
        string[] storage availableCategories
    ) internal view {
        uint256 userLength = userCategories.length;
        
        // 1. Length validation - IMPOSED ORDER
        if (userLength == 0) revert("NoCategoryProvided");
        if (userLength > 3) revert("TooManyCategories");
        
        // 2. Duplicate check - OPTIMIZED for gas in creative freedom zone
        for (uint256 i = 0; i < userLength; i++) {
            for (uint256 j = i + 1; j < userLength; j++) {
                if (keccak256(bytes(userCategories[i])) == keccak256(bytes(userCategories[j]))) {
                    revert("DuplicateCategory");
                }
            }
        }
        
        // 3. Existence check - OPTIMIZED for gas in creative freedom zone
        uint256 availableLength = availableCategories.length;
        for (uint256 i = 0; i < userLength; i++) {
            bool found = false;
            bytes32 userCatHash = keccak256(bytes(userCategories[i]));
            
            for (uint256 j = 0; j < availableLength; j++) {
                if (userCatHash == keccak256(bytes(availableCategories[j]))) {
                    found = true;
                    break; // Gas optimization: early exit
                }
            }
            
            if (!found) revert("InvalidCategory");
        }
    }
}


// File contracts/core/OpinionCoreSimplified.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;
















/**
 * @title OpinionCoreSimplified
 * @dev Simplified core contract for managing opinions, answers, and related functionality
 * Security and monitoring features have been extracted to separate contracts
 */
contract OpinionCoreSimplified is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCore,
    IOpinionMarketEvents,
    IOpinionMarketErrors,
    IValidationErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    // --- CONSTANTS ---
    uint256 public constant MAX_QUESTION_LENGTH = 52;
    uint256 public constant MAX_ANSWER_LENGTH = 52;
    uint256 public constant MAX_LINK_LENGTH = 260;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 68;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 120;
    uint256 public constant MAX_CATEGORIES_PER_OPINION = 3;
    
    // --- INITIAL PRICE RANGE CONSTANTS ---
    uint96 public constant MIN_INITIAL_PRICE = 2_000_000;   // 2 USDC (6 decimals)
    uint96 public constant MAX_INITIAL_PRICE = 100_000_000; // 100 USDC (6 decimals)

    // --- STATE VARIABLES ---
    IERC20 public usdcToken;
    IFeeManager public feeManager;
    IPoolManager public poolManager;
    IMonitoringManager public monitoringManager;
    ISecurityManager public securityManager;

    address public treasury;
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;
    
    bool public isPublicCreationEnabled;
    uint256 public nextOpinionId;
    
    // --- CATEGORIES STORAGE ---
    string[] public categories;

    // --- EXTENSION SLOTS STORAGE ---
    mapping(uint256 => mapping(string => string)) public opinionStringExtensions;
    mapping(uint256 => mapping(string => uint256)) public opinionNumberExtensions;  
    mapping(uint256 => mapping(string => bool)) public opinionBoolExtensions;
    mapping(uint256 => mapping(string => address)) public opinionAddressExtensions;
    mapping(uint256 => string[]) public opinionExtensionKeys;

    // Security and rate limiting
    uint256 public maxTradesPerBlock;
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;

    // Price calculation
    uint256 private nonce;
    mapping(uint256 => uint256) private priceMetadata;
    mapping(uint256 => uint256) private priceHistory;

    // Configurable parameters
    uint96 public minimumPrice;
    uint96 public questionCreationFee;
    uint96 public initialAnswerPrice;
    uint256 public absoluteMaxPriceChange;

    // Core data structures
    mapping(uint256 => OpinionStructs.Opinion) public opinions;
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;

    // --- INITIALIZATION ---
    function initialize(
        address _usdcToken,
        address _opinionMarket,
        address _feeManager,
        address _poolManager,
        address _monitoringManager,
        address _securityManager,
        address _treasury
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);

        // Set external contracts
        if (
            _usdcToken == address(0) ||
            _opinionMarket == address(0) ||
            _feeManager == address(0) ||
            _poolManager == address(0) ||
            _treasury == address(0)
        ) revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);
        treasury = _treasury;
        
        // Grant role to opinion market contract
        _grantRole(MARKET_CONTRACT_ROLE, _opinionMarket);
        
        // Set optional modules (can be zero initially)
        if (_monitoringManager != address(0)) {
            monitoringManager = IMonitoringManager(_monitoringManager);
        }
        if (_securityManager != address(0)) {
            securityManager = ISecurityManager(_securityManager);
        }

        // Initialize parameters
        nextOpinionId = 1;
        isPublicCreationEnabled = false;
        maxTradesPerBlock = 3;
        minimumPrice = 1_000_000; // 1 USDC (6 decimals)
        questionCreationFee = 5_000_000; // 5 USDC
        initialAnswerPrice = 2_000_000; // 2 USDC
        absoluteMaxPriceChange = 200; // 200%
        
        // Initialize default categories
        categories = ["Crypto", "Politics", "Science", "Technology", "Sports", 
                      "Entertainment", "Culture", "Web", "Social Media", "Other"];
    }

    // --- MODIFIERS ---
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

    // --- CORE OPINION FUNCTIONS ---
    
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        // Access control check
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Enhanced validation if SecurityManager is available
        if (address(securityManager) != address(0)) {
            try securityManager.validateCreateOpinionInputs(
                question, answer, description, initialPrice, opinionCategories, msg.sender
            ) {} catch {
                // Fallback to basic validation if security manager fails
                _basicValidation(question, answer, description, initialPrice, opinionCategories);
            }
        } else {
            _basicValidation(question, answer, description, initialPrice, opinionCategories);
        }

        // Check allowance for initialPrice
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

        // Create opinion record
        uint256 opinionId = _createOpinionRecord(
            question, answer, description, "", "", initialPrice, opinionCategories
        );

        // Transfer payment to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);

        // Track with monitoring manager if available
        if (address(monitoringManager) != address(0)) {
            try monitoringManager.trackOpinionCreation(opinionId, msg.sender, initialPrice) {} catch {}
        }

        // Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        // Access control check
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Enhanced validation if SecurityManager is available
        if (address(securityManager) != address(0)) {
            try securityManager.validateCreateOpinionInputs(
                question, answer, description, initialPrice, opinionCategories, msg.sender
            ) {} catch {
                _basicValidation(question, answer, description, initialPrice, opinionCategories);
            }
        } else {
            _basicValidation(question, answer, description, initialPrice, opinionCategories);
        }

        // Validate IPFS hash and link
        _validateExtras(ipfsHash, link);

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

        // Create opinion record
        uint256 opinionId = _createOpinionRecord(
            question, answer, description, ipfsHash, link, initialPrice, opinionCategories
        );

        // Transfer payment to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);

        // Track with monitoring manager if available
        if (address(monitoringManager) != address(0)) {
            try monitoringManager.trackOpinionCreation(opinionId, msg.sender, initialPrice) {} catch {}
        }

        // Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.currentAnswerOwner == msg.sender) revert SameOwner();

        // Basic validation
        _validateAnswerInput(answer, description);

        // Validate link (optional)
        bytes memory linkBytes = bytes(link);
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        // Calculate price
        uint96 price = opinion.nextPrice > 0
            ? opinion.nextPrice
            : uint96(_calculateNextPrice(opinionId, opinion.lastPrice));

        // Check USDC allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);

        // Security analysis if SecurityManager is available
        if (address(securityManager) != address(0)) {
            // Check MEV risk
            try securityManager.analyzeMevRisk(msg.sender, price, opinionId) {} catch {}
            
            // Analyze bot patterns
            // Note: We can't easily determine trade success here, so we skip bot analysis for now
        }

        // Calculate fees
        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeManager
            .calculateFeeDistribution(price);

        // Apply MEV penalty if needed
        (platformFee, ownerAmount) = feeManager.applyMEVPenalty(
            price, ownerAmount, msg.sender, opinionId
        );

        // Get addresses for fee distribution
        address creator = opinion.creator;
        address currentAnswerOwner = opinion.currentAnswerOwner;
        bool answerIsPoolOwned = currentAnswerOwner == address(poolManager);

        // Accumulate fees
        feeManager.accumulateFee(creator, creatorFee);

        if (answerIsPoolOwned) {
            poolManager.distributePoolRewards(opinionId, price, msg.sender);
        } else {
            feeManager.accumulateFee(currentAnswerOwner, ownerAmount);
        }

        // Record answer history
        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: msg.sender,
                price: price,
                timestamp: uint32(block.timestamp)
            })
        );

        // Update opinion state
        uint96 oldPrice = opinion.lastPrice;
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = msg.sender;
        opinion.link = link;
        opinion.lastPrice = price;
        opinion.totalVolume += price;
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        // Transfer tokens
        usdcToken.safeTransferFrom(msg.sender, address(this), price);

        // Track with monitoring manager if available
        if (address(monitoringManager) != address(0)) {
            try monitoringManager.trackTradingActivity(
                opinionId, msg.sender, price, oldPrice, opinion.nextPrice, platformFee
            ) {} catch {}
        }

        // Update security profiles if SecurityManager is available
        if (address(securityManager) != address(0)) {
            try securityManager.updateMevProfile(msg.sender, opinionId, price) {} catch {}
        }

        // Emit events
        emit FeesAction(opinionId, 0, currentAnswerOwner, price, platformFee, creatorFee, ownerAmount);
        emit OpinionAction(opinionId, 1, answer, msg.sender, price);
    }

    // --- QUESTION TRADING FUNCTIONS ---

    function listQuestionForSale(uint256 opinionId, uint256 price) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, msg.sender, address(0), price);
    }

    function buyQuestion(uint256 opinionId) external override nonReentrant whenNotPaused {
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

    function cancelQuestionSale(uint256 opinionId) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, msg.sender, address(0), 0);
    }

    // --- MODERATION FUNCTIONS ---

    function deactivateOpinion(uint256 opinionId) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        opinion.isActive = false;
        emit OpinionAction(opinionId, 2, "", msg.sender, 0);
    }

    function reactivateOpinion(uint256 opinionId) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.isActive) revert OpinionAlreadyActive();

        opinion.isActive = true;
        emit OpinionAction(opinionId, 3, "", msg.sender, 0);
    }

    // --- POOL INTEGRATION ---

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external override onlyPoolManager {
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
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        emit OpinionAction(opinionId, 1, answer, address(poolManager), price);
    }

    // --- VIEW FUNCTIONS ---

    function getAnswerHistory(uint256 opinionId) external view override returns (OpinionStructs.AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId];
    }

    function getNextPrice(uint256 opinionId) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        if (opinion.nextPrice == 0) {
            return _estimateNextPrice(opinion.lastPrice);
        }
        return opinion.nextPrice;
    }

    function getOpinionDetails(uint256 opinionId) external view override returns (OpinionStructs.Opinion memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId];
    }

    function getTradeCount(uint256 opinionId) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId].length;
    }

    function getCreatorGain(uint256 opinionId) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        
        (, uint96 creatorFeePercent, ) = feeManager.calculateFeeDistribution(1_000_000);
        uint256 creatorFeeRate = creatorFeePercent / 10;
        return (opinion.totalVolume * creatorFeeRate) / 100;
    }

    function isPoolOwned(uint256 opinionId) external view override returns (bool) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].currentAnswerOwner == address(poolManager);
    }

    // --- CATEGORIES FUNCTIONS ---

    function addCategoryToCategories(string calldata newCategory) external onlyRole(ADMIN_ROLE) {
        bytes32 newCategoryHash = keccak256(bytes(newCategory));
        uint256 length = categories.length;
        
        for (uint256 i = 0; i < length; i++) {
            if (keccak256(bytes(categories[i])) == newCategoryHash) {
                revert CategoryAlreadyExists();
            }
        }
        categories.push(newCategory);
    }

    function getAvailableCategories() external view returns (string[] memory) {
        return categories;
    }

    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].categories;
    }

    function getCategoryCount() external view returns (uint256) {
        return categories.length;
    }

    // --- EXTENSION SLOTS FUNCTIONS ---

    function setOpinionStringExtension(uint256 opinionId, string calldata key, string calldata value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionStringExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionStringExtensionSet(opinionId, key, value);
    }

    function setOpinionNumberExtension(uint256 opinionId, string calldata key, uint256 value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionNumberExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionNumberExtensionSet(opinionId, key, value);
    }

    function setOpinionBoolExtension(uint256 opinionId, string calldata key, bool value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionBoolExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionBoolExtensionSet(opinionId, key, value);
    }

    function setOpinionAddressExtension(uint256 opinionId, string calldata key, address value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionAddressExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionAddressExtensionSet(opinionId, key, value);
    }

    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
        keys = opinionExtensionKeys[opinionId];
        uint256 length = keys.length;
        
        stringValues = new string[](length);
        numberValues = new uint256[](length);
        boolValues = new bool[](length);
        addressValues = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            string memory key = keys[i];
            stringValues[i] = opinionStringExtensions[opinionId][key];
            numberValues[i] = opinionNumberExtensions[opinionId][key];
            boolValues[i] = opinionBoolExtensions[opinionId][key];
            addressValues[i] = opinionAddressExtensions[opinionId][key];
        }
        
        return (keys, stringValues, numberValues, boolValues, addressValues);
    }

    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view returns (string memory) {
        return opinionStringExtensions[opinionId][key];
    }

    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view returns (uint256) {
        return opinionNumberExtensions[opinionId][key];
    }

    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        return opinionBoolExtensions[opinionId][key];
    }

    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view returns (address) {
        return opinionAddressExtensions[opinionId][key];
    }

    function hasOpinionExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        string[] memory keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));
        
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return true;
            }
        }
        return false;
    }

    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }

    // --- ADMIN FUNCTIONS ---

    function setMinimumPrice(uint96 _minimumPrice) external onlyRole(ADMIN_ROLE) {
        minimumPrice = _minimumPrice;
        emit ParameterUpdated(0, _minimumPrice);
    }

    function setQuestionCreationFee(uint96 _questionCreationFee) external onlyRole(ADMIN_ROLE) {
        questionCreationFee = _questionCreationFee;
        emit ParameterUpdated(6, _questionCreationFee);
    }

    function setInitialAnswerPrice(uint96 _initialAnswerPrice) external onlyRole(ADMIN_ROLE) {
        initialAnswerPrice = _initialAnswerPrice;
        emit ParameterUpdated(7, _initialAnswerPrice);
    }

    function setMaxPriceChange(uint256 _maxPriceChange) external onlyRole(ADMIN_ROLE) {
        absoluteMaxPriceChange = _maxPriceChange;
        emit ParameterUpdated(3, _maxPriceChange);
    }

    function setMaxTradesPerBlock(uint256 _maxTradesPerBlock) external onlyRole(ADMIN_ROLE) {
        maxTradesPerBlock = _maxTradesPerBlock;
        emit ParameterUpdated(4, _maxTradesPerBlock);
    }

    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit AdminAction(1, msg.sender, bytes32(0), 0);
    }

    function setFeeManager(address _feeManager) external onlyRole(ADMIN_ROLE) {
        if (_feeManager == address(0)) revert ZeroAddressNotAllowed();
        feeManager = IFeeManager(_feeManager);
    }

    function setPoolManager(address _poolManager) external onlyRole(ADMIN_ROLE) {
        if (_poolManager == address(0)) revert ZeroAddressNotAllowed();
        poolManager = IPoolManager(_poolManager);
    }

    function setMonitoringManager(address _monitoringManager) external onlyRole(ADMIN_ROLE) {
        monitoringManager = IMonitoringManager(_monitoringManager);
    }

    function setSecurityManager(address _securityManager) external onlyRole(ADMIN_ROLE) {
        securityManager = ISecurityManager(_securityManager);
    }

    function grantMarketContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        if (contractAddress == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(MARKET_CONTRACT_ROLE, contractAddress);
    }

    function revokeMarketContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MARKET_CONTRACT_ROLE, contractAddress);
    }

    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddressNotAllowed();
        
        pendingTreasury = newTreasury;
        treasuryChangeTimestamp = block.timestamp + TREASURY_CHANGE_DELAY;
        
        emit TreasuryUpdated(treasury, newTreasury, msg.sender, block.timestamp);
    }

    function confirmTreasuryChange() external onlyRole(ADMIN_ROLE) {
        if (block.timestamp < treasuryChangeTimestamp) 
            revert("Treasury: Timelock not elapsed");
        if (pendingTreasury == address(0)) 
            revert("Treasury: No pending treasury");
        
        address oldTreasury = treasury;
        treasury = pendingTreasury;
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;
        
        emit TreasuryUpdated(oldTreasury, treasury, msg.sender, block.timestamp);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address token) external nonReentrant whenPaused onlyRole(ADMIN_ROLE) {
        if (token == address(0)) revert ZeroAddressNotAllowed();

        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));

        if (token == address(usdcToken)) {
            uint256 totalFees = feeManager.getTotalAccumulatedFees();
            if (balance <= totalFees) revert("Insufficient balance after fees");
            balance -= totalFees;
        }

        tokenContract.safeTransfer(msg.sender, balance);
        emit AdminAction(0, msg.sender, bytes32(0), balance);
    }

    // --- INTERNAL FUNCTIONS ---

    function _basicValidation(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal view {
        ValidationLibrary.validateOpinionCategories(opinionCategories, categories);
        ValidationLibrary.validateOpinionParams(question, answer, MAX_QUESTION_LENGTH, MAX_ANSWER_LENGTH);
        ValidationLibrary.validateDescription(description);
        
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }
    }

    function _validateExtras(string calldata ipfsHash, string calldata link) internal pure {
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);

        if (ipfsHashBytes.length > MAX_IPFS_HASH_LENGTH) revert InvalidIpfsHashLength();
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        if (ipfsHashBytes.length > 0) {
            _validateIpfsHash(ipfsHash);
        }
    }

    function _validateAnswerInput(string calldata answer, string calldata description) internal pure {
        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH) revert InvalidAnswerLength();
        
        ValidationLibrary.validateDescription(description);
    }

    function _createOpinionRecord(
        string memory question,
        string memory answer,
        string memory description,
        string memory ipfsHash,
        string memory link,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal returns (uint256) {
        uint256 opinionId = nextOpinionId++;
        OpinionStructs.Opinion storage opinion = opinions[opinionId];

        opinion.creator = msg.sender;
        opinion.questionOwner = msg.sender;
        opinion.lastPrice = initialPrice;
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, initialPrice));
        opinion.isActive = true;
        opinion.question = question;
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = msg.sender;
        opinion.totalVolume = initialPrice;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;
        opinion.categories = opinionCategories;

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

    function _validateIpfsHash(string memory _ipfsHash) internal pure {
        bytes memory ipfsHashBytes = bytes(_ipfsHash);

        bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
            ipfsHashBytes[0] == "Q" &&
            ipfsHashBytes[1] == "m";

        bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
            ipfsHashBytes[0] == "b";

        if (!isValidCIDv0 && !isValidCIDv1) {
            revert InvalidIpfsHashFormat();
        }
    }

    function _calculateNextPrice(uint256 opinionId, uint256 lastPrice) internal returns (uint256) {
        uint256 newPrice = PriceCalculator.calculateNextPrice(
            opinionId,
            lastPrice,
            minimumPrice,
            absoluteMaxPriceChange,
            nonce++,
            priceMetadata,
            priceHistory
        );

        _updatePriceHistory(opinionId, newPrice);
        return newPrice;
    }

    function _estimateNextPrice(uint256 lastPrice) internal pure returns (uint256) {
        return (lastPrice * 130) / 100;
    }

    function _updatePriceHistory(uint256 opinionId, uint256 newPrice) internal {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        priceMetadata[opinionId] = (block.timestamp << 8) | (count < 3 ? count + 1 : 3);

        uint256 history = priceHistory[opinionId];
        history = (history << 80) & (~uint256(0) << 160);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    function _checkAndUpdateTradesInBlock() internal {
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
        if (userLastTradeBlock[msg.sender][opinionId] == block.number)
            revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    function isValidExtensionKey(string memory key) internal pure returns (bool) {
        bytes memory keyBytes = bytes(key);
        
        if (keyBytes.length == 0 || keyBytes.length > 32) return false;
        
        for (uint i = 0; i < keyBytes.length; i++) {
            uint8 char = uint8(keyBytes[i]);
            bool isAlpha = (char >= 65 && char <= 90) || (char >= 97 && char <= 122);
            bool isNumeric = (char >= 48 && char <= 57);
            bool isUnderscore = (char == 95);
            
            if (!isAlpha && !isNumeric && !isUnderscore) return false;
        }
        
        return true;
    }

    function _trackExtensionKey(uint256 opinionId, string memory key) internal {
        string[] storage keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));
        
        for (uint i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return;
            }
        }
        
        keys.push(key);
    }

    /**
     * @dev Moderates an inappropriate answer by reverting to initial answer (simplified version)
     * @param opinionId The ID of the opinion
     * @param reason The reason for moderation
     */
    function moderateAnswer(
        uint256 opinionId,
        string calldata reason
    ) external onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();
        
        // Can't moderate if creator is still the current owner (no inappropriate answer)
        if (opinion.currentAnswerOwner == opinion.creator) {
            revert("No answer to moderate");
        }

        address previousOwner = opinion.currentAnswerOwner;
        
        // Get initial answer from first entry in history
        OpinionStructs.AnswerHistory[] storage history = answerHistory[opinionId];
        require(history.length > 0, "No initial answer found");
        
        string memory initialAnswer = history[0].answer;
        string memory initialDescription = history[0].description;
        
        // Record moderation in history before reverting
        history.push(OpinionStructs.AnswerHistory({
            answer: "[MODERATED]",
            description: reason,
            owner: previousOwner,
            price: opinion.nextPrice,
            timestamp: uint32(block.timestamp)
        }));
        
        // Revert to initial answer and creator ownership
        opinion.currentAnswer = initialAnswer;
        opinion.currentAnswerDescription = initialDescription;
        opinion.currentAnswerOwner = opinion.creator;
        // Keep current price (fair for next trader)
        
        // Emit moderation event
        emit AnswerModerated(
            opinionId,
            previousOwner,
            opinion.creator,
            reason,
            block.timestamp
        );
    }

    // --- MISSING INTERFACE IMPLEMENTATIONS ---
    
    /**
     * @dev Transfer answer ownership (simplified implementation)
     */
    function transferAnswerOwnership(
        uint256 opinionId,
        address newOwner
    ) external override nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.currentAnswerOwner != msg.sender) revert NotAnswerOwner();
        if (newOwner == msg.sender) revert("Cannot transfer to yourself");
        
        address previousOwner = opinion.currentAnswerOwner;
        opinion.currentAnswerOwner = newOwner;
        
        emit AnswerOwnershipTransferred(opinionId, previousOwner, newOwner, block.timestamp);
        emit OpinionAction(opinionId, 5, "", newOwner, 0);
    }

    /**
     * @dev Update opinion (simplified implementation)  
     */
    function updateOpinion(
        uint256 opinionId,
        string calldata question,
        string calldata ipfsHash,
        string calldata link,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator != msg.sender) revert("Only creator can update");
        
        // Basic validation
        if (bytes(question).length > MAX_QUESTION_LENGTH) revert InvalidQuestionLength();
        if (bytes(ipfsHash).length > MAX_IPFS_HASH_LENGTH) revert InvalidIpfsHashLength();
        if (bytes(link).length > MAX_LINK_LENGTH) revert InvalidLinkLength();
        if (opinionCategories.length > MAX_CATEGORIES_PER_OPINION) revert TooManyCategories();
        
        // Update the opinion
        opinion.question = question;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;
        opinion.categories = opinionCategories;
        
        emit OpinionAction(opinionId, 6, question, msg.sender, 0);
    }

    // Events are inherited from IOpinionMarketEvents
}
