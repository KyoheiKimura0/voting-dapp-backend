// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./interfaces/IVoteProject.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./types/Project.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract  VoteProject is IVoteProject, Ownable, IERC20Errors {
    mapping(bytes32 => Project.Info) public projects;
    bytes32[] public projectIds;

    constructor() Ownable(msg.sender) {}

    modifier nonZeroAddress(address account) {
        if(account == address(0)) revert ERC20InvalidReceiver(address(0));
        _;
    }

    modifier checkActiveProject(bytes32 _projectId) {
        if(!projects[_projectId].hasActive) revert ProjectNotActive("Project is not active");
        _;
    }

    function createProject(string memory _name, string memory _description, uint256 _from, uint256 _to) external
    nonZeroAddress(msg.sender){
        bytes32 projectId = keccak256(abi.encodePacked(block.timestamp, msg.sender));
        projects[projectId] = Project.Info(projectId, _name, _description, block.timestamp, _from, _to, true);
        projectIds.push(projectId);
        emit ProjectCreated(projectId, _name, _description, _from, _to);
    }

    function updateProject(bytes32 _projectId, string memory _name, string memory _description, uint256 _from, uint256 _to) external
    nonZeroAddress(msg.sender) checkActiveProject(_projectId){
        projects[_projectId].name = _name;
        projects[_projectId].description = _description;
        projects[_projectId].from = _from;
        projects[_projectId].to = _to;
        emit ProjectUpdated(_projectId, _name, _description, _from, _to);
    }

    function closeProject(bytes32 _projectId) external
    nonZeroAddress(msg.sender) checkActiveProject(_projectId) {
        projects[_projectId].hasActive = false;
        emit ProjectClosed(_projectId);
    }

    function getProject(bytes32 _projectId) external view
    nonZeroAddress(msg.sender) checkActiveProject(_projectId)
    returns (Project.Info memory) {
        return projects[_projectId];
    }

    function getActiveProjects() external view
    nonZeroAddress(msg.sender)
    returns (Project.Info[] memory) {
        uint256 activeCount = 0;
        for(uint256 i = 0; i < projectIds.length; i++) {
            if(projects[projectIds[i]].hasActive){
                activeCount++;
            }
        }
        Project.Info[] memory activeProjects = new Project.Info[](activeCount);
        uint256 j = 0;
        for(uint256 i = 0; i < projectIds.length; i++) {
            if(projects[projectIds[i]].hasActive){
                activeProjects[j] = projects[projectIds[i]];
                j++;
            }
        }
        return activeProjects;
    }
}