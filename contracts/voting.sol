// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // ユーザーごとの投票済みステータスを格納するマッピング
    mapping(address => bool) public hasVoted;

    // Yesの投票数を格納する変数
    uint256 public yesVotes;

    // Noの投票数を格納する変数
    uint256 public noVotes;

    // 投票が行われた際に発生するイベント
    event Voted(address indexed voter, bool vote);

    // 投票を行う関数
    function vote(bool _vote) external {
        // すでに投票していないか確認
        require(!hasVoted[msg.sender], "You have already voted");

        // 投票済みステータスを更新
        hasVoted[msg.sender] = true;

        // YesかNoかによって投票数を更新
        if (_vote) {
            yesVotes++;
        } else {
            noVotes++;
        }

        // 投票イベントを発生させる
        emit Voted(msg.sender, _vote);
    }

    // 投票結果を取得する関数
    function getVotes() external view returns (uint256, uint256) {
        return (yesVotes, noVotes);
    }

    // 投票をキャンセルする関数
    function cancelVote() external {
        // すでに投票しているか確認
        require(hasVoted[msg.sender], "You have not voted yet");

        // 投票済みステータスを更新
        hasVoted[msg.sender] = false;

        // 投票数を更新
        if (yesVotes > 0) {
            yesVotes--;
        } else {
            noVotes--;
        }
    }
}
