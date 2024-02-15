import {ethers} from "ethers";

export async function createProject(_contract: ethers.Contract, _name: string, _description: string, _from: number, _to: number) {
    return await _contract.createProject(_name, _description, _from, _to);
}

export async function  updateProject(_contract: ethers.Contract, _projectId: number, _name: string, _description: string, _from: number, _to: number) {
    return await _contract.updateProject(_projectId, _name, _description, _from, _to);
}

export async function getActiveProjects(_contract: ethers.Contract) {
    return await _contract.getActiveProjects();
}

export async function executeVote(_contract: ethers.Contract,_account: ethers.Wallet,_vote: boolean, _projectId: string, _comment: string) {
    return await _contract.executeVote(await _account.getAddress(), _vote, _projectId, _comment);
}

export async function cancelVote(_contract: ethers.Contract, _account: ethers.Wallet,  _projectId: string, _comment: string) {
    return await _contract.cancelVote(await _account.getAddress(), _projectId, _comment);
}

export async function getVoteResult(_contract: ethers.Contract, _projectId: string) {
    return await _contract.getVoteResult(_projectId);
}