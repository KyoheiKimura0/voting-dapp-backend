// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../types/ElectionTypes.sol";

interface IElection is ElectionTypes{
    event CandidateAdded(address candidateAddress, string name, string pledge);
    event CandidateRemoved(address candidateAddress);
    event VoteAdded(address candidateAddress);

    function addCandidate(string memory _name, string memory _promise, address _candidateAddress) external;
    function removeCandidate(address _candidateAddress) external;
    function addVote(address _candidateAddress) external;
    function getCandidate(address _candidateAddress) external view returns (Candidate memory);
    function getVoted() external view returns (bool);
    function getCandidates() external view returns (Candidate[] memory);
}