declare module '@openzeppelin/test-helpers' {
    import { Signer } from 'ethers';
    export const constants: {
        ZERO_ADDRESS: Signer;
    };
}