import { ethers } from "ethers";
import votingArtifact from "../../artifacts/contracts/Voting.sol/Voting.json";
import {envProviderKey, envPrivateKey, voiceTokenContractAddress} from "../../config/envConfig";
import {checkEnvVars, exportEnvFile} from "../utils";

// We recommend this pattern to be able to use async/await everywhere
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const factory = new ethers.ContractFactory(votingArtifact.abi, votingArtifact.bytecode, signer);
    const contract = await factory.deploy();

    await contract.waitForDeployment();

    if(contract.target == null || contract.target == ""){
        console.log("contract.addressがnullです");
        process.exit(1);
    }else{
        console.log(`\nVoting contract deploy address : ${contract.target}`);
        console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deploymentTransaction()?.hash}`);
    }
    // Write the contract address to .env file
    exportEnvFile('VOTING_CONTRACT_ADDRESS', contract.target as string);

    console.log('Completed!\n');
}
