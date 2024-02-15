import {ethers} from "ethers";

export async function mint(contract: ethers.Contract, aAmount: bigint, signer: ethers.Wallet) {
    const decimal = await contract.decimals();
    const amount : bigint = aAmount * (10n ** BigInt(decimal));
    return await contract.mint(await signer.getAddress(), amount);
}

export async function burn(contract: ethers.Contract, burnAmount: bigint, signer: ethers.Wallet) {
    const decimal = await contract.decimals();
    const amount : bigint = burnAmount * (10n ** BigInt(decimal));
    return await contract.burn(await signer.getAddress(), amount);
}