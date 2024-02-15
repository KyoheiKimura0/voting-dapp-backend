import {envPath, envPrivateKey, envProviderKey} from "../config/envConfig";
import fs from 'fs';

export function checkEnvVars(): boolean {
    if(envProviderKey == "" || envPrivateKey == ""){
        console.log("必要な環境変数のAPI_KEYが設定されていません");
        process.exit(1);
    }
    return true;
}

export function startTransactionLog() {
    let counter = 0;
    console.log('Transaction start!\n\n');
    console.log('=============================================\n');

     // 1秒ごとに更新
    return setInterval(() => {
        process.stdout.write('\x1b[0K' + 'Now waiting' + '・'.repeat(counter) + '\r');
        counter = (counter + 1) % 4;
    }, 1000);
}

export function exportEnvFile(envName: string ,contractAddress: string) {
    // Write the contract address to .env file
    let envFile = fs.readFileSync(envPath, 'utf8');
    envFile = envFile.replace(new RegExp(`(${envName}=).*`), `$1"${contractAddress}"`);
    fs.writeFileSync(envPath, envFile);
}