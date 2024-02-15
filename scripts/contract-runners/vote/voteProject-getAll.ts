import { ethers } from "ethers";
import voteProjectArtifact from "../../../artifacts/contracts/VoteProject.sol/VoteProject.json";
import { envProviderKey, envPrivateKey, voteProjectContractAddress} from "../../../config/envConfig";
import {checkEnvVars} from "../../utils";
import {getActiveProjects} from "./vote-utils";

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(voteProjectContractAddress, voteProjectArtifact.abi, signer);

    const projectInfoTx = await getActiveProjects(contract);

    for(let i = 0; i < projectInfoTx.length; i++){
        console.log('-------------------------');
        console.log("index: ", i);
        console.log(`Project ID: ${projectInfoTx[i].projectId}`);
        console.log(`Name: ${projectInfoTx[i].name}`);
        console.log(`Description: ${projectInfoTx[i].description}`);
        console.log(`Created At: ${new Date(Number(projectInfoTx[i].createdAt) * 1000).toISOString()}`);
        console.log(`From: ${new Date(Number(projectInfoTx[i].from) * 1000).toISOString()}`);
        console.log(`To: ${new Date(Number(projectInfoTx[i].to) * 1000).toISOString()}`);
        console.log(`Is Active: ${projectInfoTx[i].hasActive}`);
        console.log('-------------------------');
    }
    console.log('Transaction completed!\n');
}