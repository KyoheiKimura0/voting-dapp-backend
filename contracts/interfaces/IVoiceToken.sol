// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVoiceToken {
    error OnlyOwner(string message);

    error NonZeroAddress(address account, string message);

    error AmountExceedsBalance(string message);

    error AmountExceedsAllowances(string message);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory) ;

    function decimals() external view returns (uint8) ;

    function totalSupply() external view returns (uint256) ;

    function balanceOf(address account) external view returns (uint256);

    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
