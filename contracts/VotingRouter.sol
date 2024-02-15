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

    constructor(address _voting, address _token){
        token = _token;
        voting = _voting;
    }

    function executeVote(address _account, bool _vote, bytes32 _projectId, string memory _comment) external
    {
        Voting(voting).executeVote(_account, _vote, _projectId, _comment);
        VoiceTokenOpenzeppelin(token).burn(_account, 100);
    }

    function cancelVote(address _account, bytes32 _projectId, string memory _comment) external
    {
        Voting(voting).cancelVote(_account, _projectId, _comment);
        VoiceTokenOpenzeppelin(token).mint(_account, 100);
    }
}