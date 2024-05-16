// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IVotingRouter.sol";
import "./VoteProject.sol";
import "./Voting.sol";
import "./VoiceToken-Openzeppelin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingRouter is IVotingRouter {
    address public immutable token;
    address public immutable voting;
    uint256 public immutable voteCost;

    constructor(address _voting, address _token, uint256 _voteCost){
        token = _token;
        voting = _voting;
        voteCost = _voteCost;
    }

    function executeVote(address _account, bool _vote, bytes32 _projectId, string memory _comment) external
    {
        require(Voting(voting).executeVote(_account, _vote, _projectId, _comment), "Vote execution failed");
        require(VoiceTokenOpenzeppelin(token).burn(_account, voteCost), "Token burn failed");
    }

    function cancelVote(address _account, bytes32 _projectId, string memory _comment) external
    {
        require(Voting(voting).cancelVote(_account, _projectId, _comment), "Vote cancellation failed");
        require(VoiceTokenOpenzeppelin(token).mint(_account, voteCost), "Token mint failed");
    }
}