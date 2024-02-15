// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVoting {
    error HasVoted(string message);
    error NoBalances(string message);

    event Voted(address indexed voter, bool vote, bytes32 _projectId, string comment);
    event CancelVoted(address indexed voter, bytes32 _projectId, string comment);

    function executeVote(address account, bool _vote, bytes32 _projectId, string memory _comment) external;
    function cancelVote(address account, bytes32 _projectId, string memory _comment) external;
}