import {ethers} from "ethers";
import voiceTokenArtifact from "../../artifacts/contracts/VoiceToken-Openzeppelin.sol/VoiceTokenOpenzeppelin.json";
import {envPrivateKey, envProviderKey} from "../../config/envConfig";
import {tokenDecimals, tokenName, tokenSymbol, initialMintAmount} from "../../config/voiceTokenConfig";
import {checkEnvVars, exportEnvFile} from "../utils";

// We recommend this pattern to be able to use async/await everywhere
main(tokenName, tokenSymbol, tokenDecimals).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


async function main(name: string, symbol: string, decimals: number) {
    if(!checkEnvVars()) return;

    const provider = new ethers.InfuraProvider("sepolia", envProviderKey);
    const signer = new ethers.Wallet(envPrivateKey, provider);
    const factory = new ethers.ContractFactory(voiceTokenArtifact.abi, voiceTokenArtifact.bytecode, signer);
    const contract = await factory.deploy(name, symbol, decimals, initialMintAmount);

    await contract.waitForDeployment();

    if(contract.target == null || contract.target == ""){
        console.log("contract.addressがnullです");
        process.exit(1);
    }else{
        console.log(`\nvoiceToken contract deploy address : ${contract.target}`);
        console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deploymentTransaction()?.hash}`);
    }

    // Write the contract address to .env file
    exportEnvFile('VOICE_TOKEN_CONTRACT_ADDRESS', contract.target as string);

    // トークンの残高を表示
    const createContract = new ethers.Contract(contract.target as string, voiceTokenArtifact.abi, signer);
    const balance = await createContract.balanceOf(await signer.getAddress());
    console.log(`balance: ${balance}`);
}
