import { Signer } from 'ethers';
import { ethers as hardhatEthers } from 'hardhat';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Voting } from "../../typechain-types";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Voting", function() {

    const setupEnv = async () => {
        const signers: Signer[] = await hardhatEthers.getSigners();
        const VotingFactory = await hardhatEthers.getContractFactory("Voting");
        const voting: Voting = await VotingFactory.deploy() as Voting;
        return { signers, voting };
    };

    describe('投票実施', async function() {
        // 1票投票確認
        it("Should increase the vote count for yes", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(true);
            expect(await voting.yesVotes()).to.equal(1);
        });

        it("Should increase the vote count for no", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(false);
            expect(await voting.noVotes()).to.equal(1);
        });

        it("Should not allow a user to vote twice", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(true);
            await expect(voting.connect(signers[0]).vote(true)).to.be.rejected;
        });

        it("Should emit a Voted event on successful vote", async function() {
            const { signers, voting } = await setupEnv();
            await expect(voting.connect(signers[1]).vote(true)).to.emit(voting, "Voted").withArgs(await signers[1].getAddress(), true);
        });
    });

    describe('投票結果の取得', async function() {
        it("Should return the correct vote counts", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(true);
            await voting.connect(signers[1]).vote(true);
            await voting.connect(signers[2]).vote(false);
            const [yesVotes, noVotes] = await voting.getVotes();
            expect(yesVotes).to.equal(2);
            expect(noVotes).to.equal(1);
        });
    });

    describe('投票結果のキャンセル', async function() {
        it("Should allow a user to cancel their vote", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(true);
            await voting.connect(signers[0]).cancelVote();
            expect(await voting.yesVotes()).to.equal(0);
        });

        it("Should fail if a user who hasn't voted tries to cancel their vote", async function() {
            const { signers, voting } = await setupEnv();
            await expect(voting.connect(signers[0]).cancelVote()).to.be.rejectedWith("You have not voted yet");
        });

        it("Should update the hasVoted status of a user who cancels their vote", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(true);
            await voting.connect(signers[0]).cancelVote();
            expect(await voting.hasVoted(await signers[0].getAddress())).to.equal(false);
        });

        it("Should decrease the vote count when a vote is cancelled", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(true);
            const beforeCancel = await voting.yesVotes();
            await voting.connect(signers[0]).cancelVote();
            const afterCancel = await voting.yesVotes();
            expect(afterCancel).to.equal(beforeCancel - 1n);
        });

        it("Should decrease the noVotes count when a no vote is cancelled", async function() {
            const { signers, voting } = await setupEnv();
            await voting.connect(signers[0]).vote(false);
            const beforeCancel = await voting.noVotes();
            await voting.connect(signers[0]).cancelVote();
            const afterCancel = await voting.noVotes();
            expect(afterCancel).to.equal(beforeCancel - 1n);
        });
    });
});