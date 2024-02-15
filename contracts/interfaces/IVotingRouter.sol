// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVotingRouter {
    function executeVote(address account, bool _vote, bytes32 _projectId, string memory _comment) external;
    function cancelVote(address account, bytes32 _projectId, string memory _comment) external;
}