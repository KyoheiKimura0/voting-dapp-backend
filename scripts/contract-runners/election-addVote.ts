import { ethers } from "ethers";
import electionArtifact from "../../artifacts/contracts/Election.sol/Election.json";
import { envProviderKey, envPrivateKey, electionContractAddress} from "../../config/envConfig";
import {checkEnvVars, startTransactionLog} from "../utils";

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(electionContractAddress, electionArtifact.abi, signer);

    const tx = await contract.addVote(signer.getAddress());
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
}