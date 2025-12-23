// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Simple test contract to check if our split contracts compile and estimate sizes

import "../OpinionCore.sol";
import "../OpinionExtensions.sol";
import "../OpinionAdmin.sol";

contract ContractSizeTest {
    OpinionCore public core;
    OpinionExtensions public extensions;
    OpinionAdmin public admin;
    
    constructor() {
        // This contract is just for testing compilation
        // Actual deployment will use separate transactions
    }
    
    function estimateSizes() external pure returns (string memory) {
        return "Check compilation output for bytecode sizes";
    }
}