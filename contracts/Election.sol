// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./interfaces/IElection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./types/ElectionTypes.sol";
import "./Modifiers.sol";

contract Election is IElection, Ownable, Modifiers {
    string public electionName;
    mapping(address => Candidate) public candidates; //候補者
    address[] public candidateAddresses; //候補者のアドレス
    mapping(address => bool) public voters; //投票したかどうか

    constructor(string memory name) Ownable(msg.sender) {
        electionName = name;
    }

    function addCandidate(string memory _name, string memory _pledge, address _candidateAddress) external
    onlyOwner nonZeroAddress(msg.sender){
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_pledge).length > 0, "Pledge is required");
        require(_candidateAddress != address(0), "Candidate is invalid");
        require(!candidates[_candidateAddress].isExist, "Candidate already exists");

        candidates[_candidateAddress] = Candidate(_name, 0, _pledge, true);
        candidateAddresses.push(_candidateAddress);
        emit CandidateAdded(_candidateAddress, _name, _pledge);
    }

    function removeCandidate(address _candidateAddress) external
    onlyOwner nonZeroAddress(msg.sender) {
        require(candidates[_candidateAddress].isExist, "Candidate does not exist");
        delete candidates[_candidateAddress];

        for (uint i = 0; i < candidateAddresses.length; i++) {
            if (candidateAddresses[i] == _candidateAddress) {
                candidateAddresses[i] = candidateAddresses[candidateAddresses.length - 1];
                candidateAddresses.pop();
                break;
            }
        }
        emit CandidateRemoved(_candidateAddress);
    }

    function getCandidate(address _candidateAddress) external view returns (Candidate memory) {
        require(candidates[_candidateAddress].isExist, "Candidate does not exist");
        return candidates[_candidateAddress];
    }

    function addVote(address _candidateAddress) external
    nonZeroAddress(msg.sender) {
        require(candidates[_candidateAddress].isExist, "Candidate does not exist");
        require(!voters[msg.sender], "You have already voted");
        candidates[_candidateAddress].voteCount++;
        voters[msg.sender] = true;
        emit VoteAdded(_candidateAddress);
    }

    function getVoted() external view nonZeroAddress(msg.sender) returns (bool)
    {
        return voters[msg.sender];
    }

    function getCandidates() external view returns (Candidate[] memory) {
        require(candidateAddresses.length > 0, "No candidates available");

        Candidate[] memory _candidates = new Candidate[](candidateAddresses.length);
        for (uint i = 0; i < candidateAddresses.length; i++) {
            _candidates[i] = candidates[candidateAddresses[i]];
        }
        return _candidates;
    }

    //キャンセルは、できない仕様。投票後の変更はできない。
    // 理由：投票時に誰が投票したか記録に残るため、投票後の変更はできないようにする。
}