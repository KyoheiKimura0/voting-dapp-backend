import { Signer } from 'ethers';
import { ethers as hardhatEthers } from 'hardhat';
import chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Voting } from "../../typechain-types";
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

chai.use(chaiAsPromised);

describe("========= Voting =========", function() {
    const projectId : string = "0x8123958d4a2881afd7a212b3e2e97547ee6934627bb46720fc824b2b655b6cf8";
    const comment : string = "Test comment";

    const setUpLoadFixture = async () => {
        const [account0, account1, account2, account3]: Signer[] = await hardhatEthers.getSigners();
        const VotingFactory = await hardhatEthers.getContractFactory("Voting");
        const voting: Voting = await VotingFactory.deploy() as Voting;
        await voting.waitForDeployment();

        return { account0, account1, account2, account3, voting };
    };

    describe('[投票実施]', async function() {
        // 1票投票確認
        it("正常系",async function () {
            const { account0, account1, account2, voting } = await loadFixture(setUpLoadFixture);
            // 投票実施
            expect(await voting.connect(account0).executeVote(account1, true, projectId, comment))
                .to.emit(voting, 'VoteExecuted').withArgs(projectId, comment, account1.getAddress());

            const [yesVotes, noVotes] = await voting.getVoteResult(projectId);
            expect(yesVotes).to.equal(1n);
            expect(noVotes).to.equal(0n);

            expect(await voting.connect(account0).executeVote(account2, false, projectId, comment))
                .to.emit(voting, 'VoteExecuted').withArgs(projectId, comment, account2.getAddress());

            const [yesVotes2, noVotes2] = await voting.getVoteResult(projectId);
            expect(yesVotes2).to.equal(1n);
            expect(noVotes2).to.equal(1n);
        }).timeout(10000);

        it("異常系：checkIfVoted",async function () {
            const { account0, account1, account2, voting } = await loadFixture(setUpLoadFixture);
            // 投票実施
            expect(await voting.connect(account0).executeVote(account1, true, projectId, comment))
                .to.emit(voting, 'VoteExecuted').withArgs(projectId, comment, account1.getAddress());

            await expect(voting.connect(account0).executeVote(account1, true, projectId, comment))
                .to.be.revertedWithCustomError(voting,"HasVoted");
        });
    });

    describe('[投票取り消し]', async function() {
        it("正常系",async function () {
            const { account0, account1, voting } = await loadFixture(setUpLoadFixture);
            // 投票実施
            const tx = await voting.executeVote(account1, true, projectId, comment);
            await tx.wait();

            // 投票取り消し
            expect(await voting.connect(account0).cancelVote(account1, projectId, comment))
                .to.emit(voting, 'CancelVoted').withArgs(projectId, account1.getAddress(), comment);

            const [yesVotes, noVotes] = await voting.getVoteResult(projectId);
            expect(yesVotes).to.equal(0n);
            expect(noVotes).to.equal(0n);
        });

        it("異常系：checkIfAlreadyVoted",async function () {
            const { account0, account1, account2, voting } = await loadFixture(setUpLoadFixture);
            // 投票実施
            await expect(voting.connect(account0).cancelVote(account1, projectId, comment))
                .to.be.revertedWithCustomError(voting,"HasVoted");
        });
    });
});