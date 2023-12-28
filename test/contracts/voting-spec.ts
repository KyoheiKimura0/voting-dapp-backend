import { Signer } from 'ethers';
import { ethers as hardhatEthers } from 'hardhat';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Voting } from "../../typechain-types";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Voting", function() {

    let signers: Signer[];
    let voting: Voting;

    const setupEnv = async () => {
        const signers: Signer[] = await hardhatEthers.getSigners();
        const VotingFactory = await hardhatEthers.getContractFactory("Voting");
        const voting: Voting = await VotingFactory.deploy() as Voting;
        return { signers, voting };
    };

    beforeEach(async function() {
        const setup = await setupEnv();
        signers = setup.signers;
        voting = setup.voting;
    });

    describe('投票実施', async function() {
        const projectId = 1;
        const comment = "Test comment";

        // 1票投票確認
        it("Should increase the vote count for yes",async function () {
            await voting.connect(signers[0]).vote(true, projectId, comment);
            expect(await voting.yesVotes(projectId)).to.equal(1);
        });

        it("Should increase the vote count for no", async function() {
            await voting.connect(signers[0]).vote(false, projectId, comment);
            expect(await voting.noVotes(projectId)).to.equal(1);
        });

        it("Should not allow a user to vote twice", async function() {
            await voting.connect(signers[0]).vote(true, projectId, comment);
            await expect(voting.connect(signers[0]).vote(true, projectId, comment)).to.be.rejected;
        });

        it("Should emit a Voted event on successful vote", async function() {
            await expect(voting.connect(signers[1]).vote(true, projectId, comment)).to.emit(voting, "Voted").withArgs(await signers[1].getAddress(), true, projectId, comment);
        });
    });

    describe('投票結果の取得', async function() {
        const projectId = 1;
        const comment = "Test comment";

        it("Should return the correct vote counts", async function() {
            await voting.connect(signers[0]).vote(true, projectId, comment);
            await voting.connect(signers[1]).vote(true, projectId, comment);
            await voting.connect(signers[2]).vote(false, projectId, comment);
            const [yesVotes, noVotes] = await voting.getVotes(projectId);
            expect(yesVotes).to.equal(2);
            expect(noVotes).to.equal(1);
        });
    });

    describe('投票結果のキャンセル', async function() {
        const projectId = 1;
        const comment = "Test comment";

        it("Should allow a user to cancel their vote", async function() {
            await voting.connect(signers[0]).vote(true, projectId, comment);
            await voting.connect(signers[0]).cancelVote(projectId);
            expect(await voting.yesVotes(projectId)).to.equal(0);
        });

        it("Should fail if a user who hasn't voted tries to cancel their vote", async function() {
            await expect(voting.connect(signers[0]).cancelVote(projectId)).to.be.rejectedWith("You have not voted yet");
        });

        it("Should update the hasVoted status of a user who cancels their vote", async function() {
            await voting.connect(signers[0]).vote(true, projectId, comment);
            await voting.connect(signers[0]).cancelVote(projectId);
            expect(await voting.hasVoted(await signers[0].getAddress(), projectId)).to.equal(false);
        });

        it("Should decrease the vote count when a vote is cancelled", async function() {
            await voting.connect(signers[0]).vote(true, projectId, comment);
            const beforeCancel = await voting.yesVotes(projectId);
            await voting.connect(signers[0]).cancelVote(projectId);
            const afterCancel = await voting.yesVotes(projectId);
            expect(afterCancel).to.equal(beforeCancel - 1n);
        });

        it("Should decrease the noVotes count when a no vote is cancelled", async function() {
            await voting.connect(signers[0]).vote(false, projectId, comment);
            const beforeCancel = await voting.noVotes(projectId);
            await voting.connect(signers[0]).cancelVote(projectId);
            const afterCancel = await voting.noVotes(projectId);
            expect(afterCancel).to.equal(beforeCancel - 1n);
        });
    });
});