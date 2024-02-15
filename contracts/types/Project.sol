// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Project {
    struct Info {
        bytes32 projectId;
        string name;
        string description;
        uint256 createdAt;  //UNIX timestamp
        uint256 from; //UNIX timestamp
        uint256 to; //UNIX timestamp
        bool hasActive;
    }
}