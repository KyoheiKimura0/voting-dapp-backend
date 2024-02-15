// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../types/Project.sol";

interface IVoteProject {

    error ProjectNotActive(string message);

    event ProjectCreated(bytes32 projectId, string name, string description, uint256 from, uint256 to);
    event ProjectUpdated(bytes32 projectId, string name, string description, uint256 from, uint256 to);
    event ProjectClosed(bytes32 projectId);

    function createProject(string memory _name, string memory _description, uint256 _from, uint256 _to) external;
    function updateProject(bytes32 _projectId, string memory _name, string memory _description, uint256 _from, uint256 _to) external;
    function closeProject(bytes32  _projectId) external;
}