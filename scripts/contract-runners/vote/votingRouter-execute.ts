import { ethers } from "ethers";
import votingRouterArtifact from "../../../artifacts/contracts/VotingRouter.sol/VotingRouter.json";
import { envProviderKey, envPrivateKey, votingRouterContractAddress} from "../../../config/envConfig";
import { program, Option } from "commander";
import {checkEnvVars, startTransactionLog} from "../../utils";
import {createProject, executeVote} from "./vote-utils";

program
    .addOption(new Option('--result <string>', 'result(e.g. true, false)')
        .choices(['true', 'false'])
        .argParser((value) => value === 'true')
        .makeOptionMandatory())
    .addOption( new Option('--comment <string>', "comment").makeOptionMandatory())
    .addOption( new Option('--id <string>', "0xb7d55897d9aac9336e3ac7e31824317947c70753af87422b7265a3cdc75b5f0f").makeOptionMandatory())
    .parse()

const args = program.opts();

main(args.result, args.comment, args.id).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(result: boolean, comment: string, id: string) {
    if(!checkEnvVars()) return;

    if(!result && !comment && !id){
        console.log("resultもしくはcommentもしくはidが設定されていません");
        return;
    }
    console.log("result: ", result);
    console.log("comment: ", comment);
    console.log("id: ", id);

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(votingRouterContractAddress, votingRouterArtifact.abi, signer);

    const tx = await executeVote(contract, signer, result, id, comment);
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
}