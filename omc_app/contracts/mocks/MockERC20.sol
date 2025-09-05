// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    mapping(address => bool) public blockedAddresses;
    uint8 private _decimals = 6;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function blockAddress(address account) external {
        blockedAddresses[account] = true;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function unblockAddress(address account) external {
        blockedAddresses[account] = false;
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!blockedAddresses[to], "ERC20: transfer to blocked address");
        super._update(from, to, amount);
    }
}
