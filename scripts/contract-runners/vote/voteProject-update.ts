import { ethers } from "ethers";
import voteProjectArtifact from "../../../artifacts/contracts/VoteProject.sol/VoteProject.json";
import { envProviderKey, envPrivateKey, voteProjectContractAddress} from "../../../config/envConfig";
import { program, Option } from "commander";
import {checkEnvVars, startTransactionLog} from "../../utils";
import {createProject, getActiveProjects, updateProject} from "./vote-utils";

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

    const projectInfoTx = await getActiveProjects(contract);
    const projectId = projectInfoTx[0].projectId;
    console.log(`get projectId: ${projectId}\n`);

    console.log('OLD-------------------------');
    console.log(`Project ID: ${projectInfoTx[0].projectId}`);
    console.log(`Name: ${projectInfoTx[0].name}`);
    console.log(`Description: ${projectInfoTx[0].description}`);
    console.log(`Created At: ${new Date(Number(projectInfoTx[0].createdAt) * 1000).toISOString()}`);
    console.log(`From: ${new Date(Number(projectInfoTx[0].from) * 1000).toISOString()}`);
    console.log(`To: ${new Date(Number(projectInfoTx[0].to) * 1000).toISOString()}`);
    console.log(`Yes Votes: ${projectInfoTx[0].yesVotes}`);
    console.log(`No Votes: ${projectInfoTx[0].noVotes}`);
    console.log(`Is Active: ${projectInfoTx[0].hasActive}`);
    console.log('-------------------------');

    const tx = await updateProject(contract, projectId, name, description, unixFromTime, unixToTime);
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}\n`);

    const newProjectInfoTx = await getActiveProjects(contract);
    console.log('NEW-------------------------');
    console.log(`Project ID: ${newProjectInfoTx[0].projectId}`);
    console.log(`Name: ${newProjectInfoTx[0].name}`);
    console.log(`Description: ${newProjectInfoTx[0].description}`);
    console.log(`Created At: ${new Date(Number(newProjectInfoTx[0].createdAt) * 1000).toISOString()}`);
    console.log(`From: ${new Date(Number(newProjectInfoTx[0].from) * 1000).toISOString()}`);
    console.log(`To: ${new Date(Number(newProjectInfoTx[0].to) * 1000).toISOString()}`);
    console.log(`Yes Votes: ${newProjectInfoTx[0].yesVotes}`);
    console.log(`No Votes: ${newProjectInfoTx[0].noVotes}`);
    console.log(`Is Active: ${newProjectInfoTx[0].hasActive}`);
    console.log('-------------------------');
}

function convertToUnixTime(dateString: string): number {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
}