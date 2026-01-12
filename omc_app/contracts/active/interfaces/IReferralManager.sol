// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IReferralManager
 * @dev Interface for the ReferralManager contract
 */
interface IReferralManager {
    /**
     * @dev Generate a referral code for a user
     * @param user Address to generate code for
     * @return referralCode The generated referral code
     */
    function generateReferralCode(address user) external returns (uint256 referralCode);

    /**
     * @dev Process a referral when new user creates first opinion
     * @param referee New user address
     * @param referralCode Referral code used
     * @return success Whether referral was processed successfully
     */
    function processReferral(
        address referee,
        uint256 referralCode
    ) external returns (bool success);

    /**
     * @dev Check if user has free mints available
     * @param user Address to check
     * @return available Number of free mints available
     */
    function getAvailableFreeMints(address user) external view returns (uint256 available);

    /**
     * @dev Use a free mint (called by OpinionCore)
     * @param user Address using the free mint
     * @param opinionId Opinion ID being created
     * @return success Whether free mint was successfully used
     */
    function useFreeMint(
        address user,
        uint256 opinionId
    ) external returns (bool success);

    /**
     * @dev Get referral statistics for a user
     */
    function getReferralStats(address user) external view returns (
        uint256 totalReferrals,
        uint256 availableFreeMints,
        uint256 totalFreeMints,
        uint256 referralCode,
        bool isReferred,
        address referredBy
    );

    /**
     * @dev Get referrer address from referral code
     */
    function getReferrerFromCode(uint256 referralCode) external view returns (address);
}