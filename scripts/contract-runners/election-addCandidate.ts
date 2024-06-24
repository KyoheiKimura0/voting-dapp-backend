import {ethers} from "ethers";
import electionArtifact from "../../artifacts/contracts/Election.sol/Election.json";
import {electionContractAddress, envPrivateKey, envProviderKey} from "../../config/envConfig";
import {checkEnvVars, startTransactionLog} from "../utils";
import {Option, program} from "commander";

program
    .addOption( new Option('--name <string>', "project name").makeOptionMandatory())
    .addOption( new Option('--pledge <string>', "project pledge").makeOptionMandatory())
    .parse()

const args = program.opts();

main(args.name, args.pledge).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main(_name: string, _pledge: string) {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const contract = new ethers.Contract(electionContractAddress, electionArtifact.abi, signer);

    const tx = await contract.addCandidate(_name, _pledge, signer.getAddress());
    // ログ出力のためのカウンターとタイマーを設定
    const timer = startTransactionLog();

    await tx.wait();

    clearInterval(timer);
    console.log('Transaction completed!\n');
    console.log(`singer address: ${await signer.getAddress()}`);

    //成功したらトランザクションハッシュを表示　また、トランザクションURLを表示
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
}