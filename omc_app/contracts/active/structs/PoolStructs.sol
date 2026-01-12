// structs/PoolStructs.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

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
