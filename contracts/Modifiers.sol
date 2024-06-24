// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract Modifiers is IERC20Errors{
    modifier nonZeroAddress(address account) {
        if(account == address(0)) revert ERC20InvalidReceiver(address(0));
        _;
    }
}