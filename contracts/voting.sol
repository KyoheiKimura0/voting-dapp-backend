// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // ユーザーごとの投票済みステータスを格納するマッピング
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // 各プロジェクトのYesの投票数を格納するマッピング
    mapping(uint256 => uint256) public yesVotes;

    // 各プロジェクトのNoの投票数を格納するマッピング
    mapping(uint256 => uint256) public noVotes;

    // 投票が行われた際に発生するイベント
    event Voted(address indexed voter, bool vote, uint256 projectId, string comment);

    // 投票を行う関数
    function vote(bool _vote, uint256 _projectId, string memory _comment) external {
        // すでに投票していないか確認
        require(!hasVoted[msg.sender][_projectId], "You have already voted");

        // 投票済みステータスを更新
        hasVoted[msg.sender][_projectId] = true;

        // YesかNoかによって投票数を更新
        if (_vote) {
            yesVotes[_projectId]++;
        } else {
            noVotes[_projectId]++;
        }

        // 投票イベントを発生させる
        emit Voted(msg.sender, _vote, _projectId, _comment);
    }

    // 投票結果を取得する関数
    function getVotes(uint256 _projectId) external view returns (uint256, uint256) {
        return (yesVotes[_projectId], noVotes[_projectId]);
    }

    // 投票をキャンセルする関数
    function cancelVote(uint256 _projectId) external {
        // すでに投票しているか確認
        require(hasVoted[msg.sender][_projectId], "You have not voted yet");

        // 投票済みステータスを更新
        hasVoted[msg.sender][_projectId] = false;

        // 投票数を更新
        if (yesVotes[_projectId] > 0) {
            yesVotes[_projectId]--;
        } else {
            noVotes[_projectId]--;
        }
    }
}