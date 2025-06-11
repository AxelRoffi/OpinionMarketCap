// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library OpinionMarketErrors {
    // Basic error types
    error ERR(uint8 code);
    error ERR_DATA(uint8 code, uint256 param1, uint256 param2);

    // Core errors
    uint8 constant CONTRACT_PAUSED = 1;
    uint8 constant CONTRACT_NOT_PAUSED = 2;
    uint8 constant WITHDRAWAL_FAILED = 3;
    uint8 constant EMPTY_STRING = 4;
    uint8 constant UNAUTHORIZED_CREATOR = 5;
    uint8 constant OPINION_NOT_ACTIVE = 6;
    uint8 constant TRANSFER_FAILED = 7;
    uint8 constant OPINION_NOT_FOUND = 8;
    uint8 constant ONE_TRADE_PER_BLOCK = 9;
    uint8 constant NO_FEES_TO_CLAIM = 10;
    uint8 constant OPINION_ALREADY_ACTIVE = 11;
    uint8 constant SAME_OWNER = 12;

    // Validation errors
    uint8 constant INVALID_QUESTION_LENGTH = 20;
    uint8 constant INVALID_ANSWER_LENGTH = 21;
    uint8 constant INVALID_PRICE = 22;
    uint8 constant INVALID_LINK_LENGTH = 23;
    uint8 constant INVALID_IPFS_HASH_LENGTH = 24;
    uint8 constant INVALID_IPFS_HASH_FORMAT = 25;

    // Parameterized errors
    uint8 constant INSUFFICIENT_ALLOWANCE = 40;
    uint8 constant PRICE_CHANGE_EXCEEDS_LIMIT = 41;
    uint8 constant MAX_TRADES_PER_BLOCK_EXCEEDED = 42;

    // Pool errors
    uint8 constant POOL_INVALID_OPINION_ID = 50;
    uint8 constant POOL_SAME_ANSWER_AS_CURRENT = 51;
    uint8 constant POOL_DEADLINE_TOO_SHORT = 52;
    uint8 constant POOL_DEADLINE_TOO_LONG = 53;
    uint8 constant POOL_INITIAL_CONTRIBUTION_TOO_LOW = 54;
    uint8 constant POOL_INVALID_PROPOSED_ANSWER = 55;
    uint8 constant POOL_INVALID_POOL_ID = 56;
    uint8 constant POOL_NOT_ACTIVE = 57;
    uint8 constant POOL_DEADLINE_PASSED = 58;
    uint8 constant POOL_CONTRIBUTION_TOO_LOW = 59;
    uint8 constant POOL_INSUFFICIENT_FUNDS = 60;
    uint8 constant POOL_EXECUTION_FAILED = 61;
    uint8 constant POOL_ALREADY_EXECUTED = 62;
    uint8 constant POOL_NO_CONTRIBUTION = 63;
    uint8 constant POOL_NOT_EXPIRED = 64;
    uint8 constant POOL_ALREADY_REFUNDED = 65;
    uint8 constant POOL_INVALID_NAME_LENGTH = 66;
    uint8 constant POOL_ALREADY_FUNDED = 67;
}
//check errorMap.js for FE integration
