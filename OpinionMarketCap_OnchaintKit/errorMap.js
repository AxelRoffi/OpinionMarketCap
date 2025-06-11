// errorMap.js
export const ERROR_MAP = {
    // Core errors
    1: "Contract is paused",
    2: "Contract is not paused",
    3: "Withdrawal failed",
    4: "Empty string provided",
    5: "Unauthorized: Only owner can create opinions",
    6: "Opinion is not active",
    7: "Transfer failed",
    8: "Opinion not found",
    9: "Only one trade allowed per block for this opinion",
    10: "No fees to claim",
    11: "Opinion is already active",
    12: "You already own this opinion",
    
    // Validation errors
    20: "Question length exceeds maximum",
    21: "Answer length exceeds maximum",
    22: "Invalid price",
    23: "Link length exceeds maximum",
    24: "IPFS hash length exceeds maximum",
    25: "Invalid IPFS hash format",
    
    // Parameterized errors
    40: (required, provided) => `Insufficient allowance: required ${required} USDC, provided ${provided} USDC`,
    41: (increase, limit) => `Price change exceeds limit: ${increase}% > ${limit}%`,
    42: (current, max) => `Max trades per block exceeded: ${current} > ${max}`,
    
    // Pool errors
    50: (opinionId) => `Invalid opinion ID: ${opinionId}`,
    51: (opinionId, answer) => `Proposed answer is the same as current answer for opinion ${opinionId}`,
    52: (deadline, minDuration) => `Pool deadline too short: ${deadline} < ${minDuration}`,
    53: (deadline, maxDuration) => `Pool deadline too long: ${deadline} > ${maxDuration}`,
    54: (provided, minimum) => `Initial contribution too low: ${provided} < ${minimum}`,
    55: "Invalid proposed answer",
    56: (poolId) => `Invalid pool ID: ${poolId}`,
    57: (poolId, status) => `Pool not active: ID ${poolId}, status ${status}`,
    58: (poolId, deadline) => `Pool deadline has passed: ID ${poolId}, deadline ${deadline}`,
    59: (provided, minimum) => `Pool contribution too low: ${provided} < ${minimum}`,
    60: "Pool has insufficient funds",
    61: (poolId) => `Pool execution failed: ID ${poolId}`,
    62: (poolId) => `Pool already executed: ID ${poolId}`,
    63: (poolId, user) => `No contribution found for user ${user} in pool ${poolId}`,
    64: (poolId, deadline) => `Pool not expired: ID ${poolId}, deadline ${deadline}`,
    65: (poolId, user) => `User ${user} already refunded for pool ${poolId}`,
    66: "Pool name length invalid",
    67: (poolId) => `Pool already fully funded: ID ${poolId}`
};

// Error parser function for smart contract errors
export function parseContractError(error) {
    // Check if this is one of our custom errors
    if (error && error.reason) {
        // Try to extract the error code and parameters
        const match = error.reason.match(/ERR\((\d+)\)/);
        if (match) {
            const code = parseInt(match[1]);
            const errorInfo = ERROR_MAP[code];
            
            if (typeof errorInfo === 'function') {
                // This error needs parameters, but we don't have them in simple ERR
                // Return a generic message
                return `Error: ${code}`;
            } else {
                return errorInfo || `Unknown error: ${code}`;
            }
        }
        
        // Try to match parameterized errors
        const dataMatch = error.reason.match(/ERR_DATA\((\d+),(\d+),(\d+)\)/);
        if (dataMatch) {
            const code = parseInt(dataMatch[1]);
            const param1 = parseInt(dataMatch[2]);
            const param2 = parseInt(dataMatch[3]);
            
            const errorHandler = ERROR_MAP[code];
            if (typeof errorHandler === 'function') {
                return errorHandler(param1, param2);
            } else {
                return errorHandler || `Unknown error: ${code} [${param1}, ${param2}]`;
            }
        }
    }
    
    // Fallback for other errors
    return error.message || "Unknown error occurred";
}