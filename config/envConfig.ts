// envConfig.ts
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

export const envProviderKey : string = process.env.API_KEY ?? "";
export const envPrivateKey : string = process.env.PRIVATE_KEY ?? "";

export const envPath = path.join(__dirname, '../.env');

export const voiceTokenContractAddress: string = process.env.VOICE_TOKEN_CONTRACT_ADDRESS ?? "";
export const votingContractAddress: string = process.env.VOTING_CONTRACT_ADDRESS ?? "";
export const voteProjectContractAddress: string = process.env.VOTE_PROJECT_CONTRACT_ADDRESS ?? "";
export const votingRouterContractAddress: string = process.env.VOTING_ROUTER_CONTRACT_ADDRESS ?? "";