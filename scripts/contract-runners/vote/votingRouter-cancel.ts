import { ethers } from "ethers";
import votingRouterArtifact from "../../../artifacts/contracts/VotingRouter.sol/VotingRouter.json";
import { envProviderKey, envPrivateKey, votingRouterContractAddress} from "../../../config/envConfig";
import { program, Option } from "commander";
import {checkEnvVars, startTransactionLog} from "../../utils";
import {cancelVote} from "./vote-utils";

program
    .addOption( new Option('--comment <string>', "comment").makeOptionMandatory())
    .addOption( new Option('--id <string>', "0xb7d55897d9aac9336e3ac7e31824317947c70753af87422b7265a3cdc75b5f0f").makeOptionMandatory())
    .parse()

const args = program.opts();

main(args.comment, args.id).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(comment: string, id: string) {
    if(!checkEnvVars()) return;

    if(!comment && !id){
        console.log("resultもしくはcommentもしくはidが設定されていません");
        return;
    }
    console.log("comment: ", comment);
    console.log("id: ", id);

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(votingRouterContractAddress, votingRouterArtifact.abi, signer);

    const tx = await cancelVote(contract, signer, id, comment);
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
}