import { ethers } from "ethers";
import votingRouterArtifact from "../../artifacts/contracts/VotingRouter.sol/VotingRouter.json";
import {envProviderKey, envPrivateKey, voiceTokenContractAddress, votingContractAddress} from "../../config/envConfig";
import {checkEnvVars, exportEnvFile} from "../utils";
import voiceTokenArtifact from "../../artifacts/contracts/VoiceToken-Openzeppelin.sol/VoiceTokenOpenzeppelin.json";
import votingArtifact from "../../artifacts/contracts/Voting.sol/Voting.json";


// We recommend this pattern to be able to use async/await everywhere
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const factory = new ethers.ContractFactory(votingRouterArtifact.abi, votingRouterArtifact.bytecode, signer);

    const token = new ethers.Contract(voiceTokenContractAddress, voiceTokenArtifact.abi, signer);
    const voting = new ethers.Contract(votingContractAddress, votingArtifact.abi, signer);

    const contract = await factory.deploy(voting, token);

    await contract.waitForDeployment();

    if(contract.target == null || contract.target == ""){
        console.log("contract.addressがnullです");
        process.exit(1);
    }else{
        console.log(`\nVotingRouter contract deploy address : ${contract.target}`);
        console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deploymentTransaction()?.hash}`);
    }
    // Write the contract address to .env file
    exportEnvFile('VOTING_ROUTER_CONTRACT_ADDRESS', contract.target as string);

    console.log('Completed!\n');
}
