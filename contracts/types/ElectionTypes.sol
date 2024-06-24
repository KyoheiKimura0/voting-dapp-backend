// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ElectionTypes {
    struct Candidate{
        string name;
        uint256 voteCount;
        string pledge;
        bool isExist;
    }
}
