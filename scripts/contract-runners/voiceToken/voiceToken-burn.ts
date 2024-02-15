import { ethers } from "ethers";
import voiceTokenArtifact from "../../../artifacts/contracts/VoiceToken-Openzeppelin.sol/VoiceTokenOpenzeppelin.json";
import { envProviderKey, envPrivateKey, voiceTokenContractAddress} from "../../../config/envConfig";
import { program, Option } from "commander";
import {checkEnvVars, startTransactionLog} from "../../utils";
import { burn } from "./voiceToken-utils";

program
    .addOption( new Option('--burn <number>', "burn amount")
        .argParser(parseInt).makeOptionMandatory()).parse();

const args = program.opts();

main(args.burn).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(burnAmount: number) {
    if(!checkEnvVars()) return;

    if(!burnAmount){
        console.log("burnAmountが設定されていません");
        return;
    }
    console.log("burnAmount: ", burnAmount);

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(voiceTokenContractAddress, voiceTokenArtifact.abi, signer);

    // トークンをburnする
    const tx = await burn(contract, BigInt(burnAmount), signer);
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
    // トークンの残高を表示
    const balance = await contract.balanceOf(await signer.getAddress());
    console.log(`balance: ${balance}`);
}