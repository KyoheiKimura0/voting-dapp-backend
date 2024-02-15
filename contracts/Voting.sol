// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IVoting.sol";

contract Voting is IVoting {
    mapping(address => mapping(bytes32 => bool)) public hasVoted;
    mapping(address => mapping(bytes32 => bool)) public userVotes;
    mapping(bytes32 => uint256) public yesVotes;
    mapping(bytes32 => uint256) public noVotes;

    constructor() {}

    // 投票していないかどうかをチェック
    modifier checkIfVoted(address _sender, bytes32 _projectId) {
        if(hasVoted[_sender][_projectId]) revert HasVoted("You have already voted");
        _;
    }

    // 投票済みかどうかチェック
    modifier checkIfAlreadyVoted(address _sender, bytes32 _projectId) {
        if(!hasVoted[_sender][_projectId]) revert HasVoted("You have not voted");
        _;
    }

    function getVoteResult(bytes32 _projectId) external view returns (uint256 yes, uint256 no) {
        return (yesVotes[_projectId], noVotes[_projectId]);
    }

    // ユーザーの投票結果を取得  // 追加
    function getUserVote(address _account, bytes32 _projectId) external view returns (bool) {
        return userVotes[_account][_projectId];
    }

    // 投票実施
    function executeVote(address _account, bool _vote, bytes32 _projectId, string memory _comment) external
    checkIfVoted(_account, _projectId) {
        hasVoted[_account][_projectId] = true;
        userVotes[_account][_projectId] = _vote;  // 追加

        if (_vote) {
            yesVotes[_projectId]++;
        } else {
            noVotes[_projectId]++;
        }
        emit Voted(_account, _vote, _projectId, _comment);
    }

    // 投票をキャンセル
    function cancelVote(address account, bytes32 _projectId, string memory _comment) external
    checkIfAlreadyVoted(account, _projectId) {
        hasVoted[account][_projectId] = false;
        userVotes[account][_projectId] = false;  // 追加

        if (yesVotes[_projectId] > 0) {
            yesVotes[_projectId]--;
        } else {
            noVotes[_projectId]--;
        }
        emit CancelVoted(account, _projectId, _comment);
    }
}