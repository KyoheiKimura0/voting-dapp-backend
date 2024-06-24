import { ethers } from "ethers";
import {envProviderKey, envPrivateKey} from "../../config/envConfig";
import {checkEnvVars, exportEnvFile} from "../utils";
import electionArtifact from "../../artifacts/contracts/Election.sol/Election.json";
import { program, Option } from "commander";

program
    .addOption( new Option('--name <string>', "project name").makeOptionMandatory())
    .parse()

const args = program.opts();

main(args.name).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(name: string) {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const factory = new ethers.ContractFactory(electionArtifact.abi, electionArtifact.bytecode, signer);
    const contract = await factory.deploy(name);


    await contract.waitForDeployment();

    if(contract.target == null || contract.target == ""){
        console.log("contract.addressがnullです");
        process.exit(1);
    }else{
        console.log(`\nElection contract deploy address : ${contract.target}`);
        console.log(`\nsigner address : ${signer.address}`);
        console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deploymentTransaction()?.hash}`);
    }
    // Write the contract address to .env file
    exportEnvFile('ELECTION_CONTRACT_ADDRESS', contract.target as string);

    console.log('Completed!\n');
}
