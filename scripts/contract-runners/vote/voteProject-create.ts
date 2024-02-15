import { ethers } from "ethers";
import voteProjectArtifact from "../../../artifacts/contracts/VoteProject.sol/VoteProject.json";
import { envProviderKey, envPrivateKey, voteProjectContractAddress} from "../../../config/envConfig";
import { program, Option } from "commander";
import {checkEnvVars, startTransactionLog} from "../../utils";
import { createProject } from "./vote-utils";

program
    .addOption( new Option('--name <string>', "project name").makeOptionMandatory())
    .addOption( new Option('--description <string>', "project description").makeOptionMandatory())
    .addOption( new Option('--from <string>', "2022-12-31T23:59:59Z").makeOptionMandatory())
    .addOption( new Option('--to <string>', "2024-12-31T23:59:59Z").makeOptionMandatory())
    .parse()

const args = program.opts();

main(args.name, args.description, args.from, args.to).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(name: string, description: string, from: string, to: string) {
    if(!checkEnvVars()) return;

    if(!name && !description){
        console.log("nameもしくはdescriptionが設定されていません");
        return;
    }
    console.log("name: ", name);
    console.log("description: ", description);

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(voteProjectContractAddress, voteProjectArtifact.abi, signer);

    // 使用例
    const unixFromTime = convertToUnixTime(from);
    const unixToTime = convertToUnixTime(to);

    const tx = await createProject(contract, name, description, unixFromTime, unixToTime);
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
}

function convertToUnixTime(dateString: string): number {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
}