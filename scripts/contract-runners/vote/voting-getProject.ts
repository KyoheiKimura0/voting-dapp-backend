import { ethers } from "ethers";
import votingArtifact from "../../../artifacts/contracts/Voting.sol/Voting.json";
import { envProviderKey, envPrivateKey, votingContractAddress} from "../../../config/envConfig";
import {checkEnvVars} from "../../utils";
import {getVoteResult} from "./vote-utils";
import { program, Option } from "commander";

program
    .addOption( new Option('--id <string>', "0xb7d55897d9aac9336e3ac7e31824317947c70753af87422b7265a3cdc75b5f0f").makeOptionMandatory())
    .parse()

const args = program.opts();

main(args.id).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(id: string) {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(votingContractAddress, votingArtifact.abi, signer);

    const result = await getVoteResult(contract, id);

    console.log(`Yes votes: ${result[0].toString()}, No votes: ${result[1].toString()}`);
    console.log('Transaction completed!\n');
}