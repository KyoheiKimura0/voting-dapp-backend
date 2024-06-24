import {Signer} from 'ethers';
import {ethers as hardhatEthers} from 'hardhat';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {Election} from "../../typechain-types";
import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';
import { constants } from '@openzeppelin/test-helpers';

chai.use(chaiAsPromised);

describe("========= Election.sol =========", function() {
    const setUpLoadFixture = async () => {
        const [account0, account1, account2, account3, account4, account5, account6, account7, account8, account9, account10]: Signer[] = await hardhatEthers.getSigners();
        const electionFactory = await hardhatEthers.getContractFactory("Election");
        const election: Election = await electionFactory.deploy("test Election") as Election;
        await election.waitForDeployment();

        return { account0, account1, account2, account3, account4, account5, account6, account7, account8, account9, account10, election };
    }

    const setUpCandidateFixture = async (_name: string, _pledge: string, account: Signer) => {
        const { account0, election } = await setUpLoadFixture();
        const candidateName = _name;
        const pledge = _pledge;
        const candidateAddress = await account.getAddress();

        await election.connect(account0).addCandidate(candidateName, pledge, candidateAddress);
        const createCandidate = await election.getCandidate(candidateAddress);

        return { createCandidate };
    }


    describe("[選挙作成]", async function () {
        it("正常系", async function () {
            const { election } = await loadFixture(setUpLoadFixture);
            const name = "test Election";

            const electionName = await election.electionName();
            expect(electionName).to.equal(name);
        });

        describe("[addCandidate]", async function () {
            it("正常系", async function () {
                const {  account0, account1,election } = await loadFixture(setUpLoadFixture);

                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                expect(await election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.emit(election, 'CandidateAdded').withArgs(candidate, pledge, candidateAddress);

                const getCandidate1 = await election.getCandidate(candidateAddress);
                expect(getCandidate1.name).to.equal(candidate);
                expect(getCandidate1.pledge).to.equal(pledge);
                expect(getCandidate1.voteCount).to.equal(0);
                expect(getCandidate1.isExist).to.equal(true);
            });

            it("異常系：候補者存在済み", async function () {
                const {  account0, account1, election } = await loadFixture(setUpLoadFixture);
                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                await election.connect(account0).addCandidate(candidate, pledge, candidateAddress);
                await expect(election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.be.revertedWith("Candidate already exists");
            });

            it("異常系：ZeroAddress", async function () {
                const {  account0, account1, election } = await loadFixture(setUpLoadFixture);
                const candidate = "Candidate1";
                const pledge = "test pledge";
                await account1.getAddress();
                await expect(election.connect(account0).addCandidate(candidate, pledge, constants.ZERO_ADDRESS))
                    .to.be.revertedWith("Candidate is invalid");
            });

            it("異常系：pledgeが空", async function () {
                const {  account0, account1, election } = await loadFixture(setUpLoadFixture);
                const candidate = "Candidate1";
                const pledge = "";
                const candidateAddress = await account1.getAddress();

                await expect(election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.be.revertedWith("Pledge is required");
            });

            it("異常系：名前が空", async function () {
                const {  account0, account1, election } = await loadFixture(setUpLoadFixture);
                const candidate = "";
                const pledge = "test pledge2";
                const candidateAddress = await account1.getAddress();

                await expect(election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.be.revertedWith("Name is required");
            });

            it("異常系：onlyOwner", async function () {
                const {  account0, account1, account2, election } = await loadFixture(setUpLoadFixture);
                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                await expect(election.connect(account1).addCandidate(candidate, pledge, candidateAddress))
                    .to.be.revertedWithCustomError(election, "OwnableUnauthorizedAccount");
            });
        });

        describe("[removeCandidate]", async function () {
            it("正常系", async function () {
                const {  account0, account1,election } = await loadFixture(setUpLoadFixture);

                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                expect(await election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.emit(election, 'CandidateAdded').withArgs(candidate, pledge, candidateAddress);

                expect(await election.connect(account0).removeCandidate(account1.getAddress()))
                    .to.emit(election, 'CandidateRemoved').withArgs(account1.getAddress());
            });

            it("異常系：候補者存在しない", async function () {
                const {  account0, account2, election } = await loadFixture(setUpLoadFixture);
                await expect(election.connect(account0).removeCandidate(await account2.getAddress()))
                    .to.be.revertedWith("Candidate does not exist");
            });
        });

        describe("[getCandidate]", async function () {
            it("正常系", async function () {
                const { account1 } = await loadFixture(setUpLoadFixture);

                const candidateName = "test Candidate1";
                const pledge = "test2 pledge";
                const {createCandidate } = await setUpCandidateFixture(candidateName, pledge, account1);

                expect(createCandidate.name).to.equal(candidateName);
                expect(createCandidate.pledge).to.equal(pledge);
                expect(createCandidate.voteCount).to.equal(0);
                expect(createCandidate.isExist).to.equal(true);
            });

            it("異常系：候補者存在しない", async function () {
                const { account0, account1, election } = await loadFixture(setUpLoadFixture);
                await expect(election.getCandidate(await account1.getAddress()))
                    .to.be.revertedWith("Candidate does not exist");
            });
        });

        describe("[addVote]", async function () {
            it("正常系", async function () {
                const { account0, account1, election } = await loadFixture(setUpLoadFixture);

                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                expect(await election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.emit(election, 'CandidateAdded').withArgs(candidate, pledge, candidateAddress);

                expect(await election.connect(account0).addVote(await account1.getAddress()))
                    .to.emit(election, 'VoteAdded').withArgs(await account1.getAddress());

                const getCandidate = await election.getCandidate(await account1.getAddress());
                expect(getCandidate.voteCount).to.equal(1);
            });

            it("正常系: 複数候補者", async function () {
                const { account0, account1, account2,account3,account4,account5,account6, election } = await loadFixture(setUpLoadFixture);

                const candidate1 = "Candidate1";
                const pledge1 = "test pledge";
                const candidateAddress1 = await account1.getAddress();

                const candidate2 = "Candidate2";
                const pledge2 = "test2 pledge";
                const candidateAddress2 = await account2.getAddress();

                await election.connect(account0).addCandidate(candidate1, pledge1, candidateAddress1);
                await election.connect(account0).addCandidate(candidate2, pledge2, candidateAddress2);

                await election.connect(account0).addVote(await account1.getAddress());
                await election.connect(account3).addVote(await account1.getAddress());

                await election.connect(account4).addVote(await account2.getAddress());
                await election.connect(account5).addVote(await account2.getAddress());
                await election.connect(account6).addVote(await account2.getAddress());

                const getCandidate1 = await election.getCandidate(await account1.getAddress());
                const getCandidate2 = await election.getCandidate(await account2.getAddress());
                expect(getCandidate1.voteCount).to.equal(2);
                expect(getCandidate2.voteCount).to.equal(3);
            });

            it("異常系：候補者存在しない", async function () {
                const { account0, account1, election } = await loadFixture(setUpLoadFixture);
                await expect(election.connect(account0).addVote(await account1.getAddress()))
                    .to.be.revertedWith("Candidate does not exist");
            });

            it("異常系：alreadyVoted", async function () {
                const { account0, account1, election } = await loadFixture(setUpLoadFixture);

                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                await election.connect(account0).addCandidate(candidate, pledge, candidateAddress);
                await election.connect(account0).addVote(await account1.getAddress());

                await expect(election.connect(account0).addVote(await account1.getAddress()))
                    .to.be.revertedWith("You have already voted");
            });
        });

        describe("[getVoted]", async function () {
            it("正常系", async function () {
                const { account0, account1, election } = await loadFixture(setUpLoadFixture);

                const candidate = "Candidate1";
                const pledge = "test pledge";
                const candidateAddress = await account1.getAddress();

                expect(await election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.emit(election, 'CandidateAdded').withArgs(candidate, pledge, candidateAddress);

                expect(await election.connect(account0).addVote(await account1.getAddress()))
                    .to.emit(election, 'VoteAdded').withArgs(await account1.getAddress());

                expect(await election.connect(account0).getVoted()).to.equal(true);
                expect(await election.connect(account1).getVoted()).to.equal(false);
            });

            it("異常系", async function () {
                const { account0, account1, election } = await loadFixture(setUpLoadFixture);

                const candidate = "Candidate3";
                const pledge = "test pledge3";
                const candidateAddress = await account1.getAddress();

                expect(await election.connect(account0).addCandidate(candidate, pledge, candidateAddress))
                    .to.emit(election, 'CandidateAdded').withArgs(candidate, pledge, candidateAddress);

                expect(await election.connect(account0).getVoted()).to.equal(false);
            });
        });

        describe("[getCandidates]", async function () {
            it("正常系", async function () {
                const { account0, account1, account2, account3, election } = await loadFixture(setUpLoadFixture);

                await election.connect(account0).addCandidate("tester1", "pledge1", account1.getAddress());
                await election.connect(account0).addCandidate("tester2", "pledge2", account2.getAddress());
                await election.connect(account0).addCandidate("tester3", "pledge3", account3.getAddress());

                expect(await election.connect(account0).getCandidates()).to.have.lengthOf(3);
                expect(await election.connect(account0).getCandidates()).to.deep.equal([
                    [ 'tester1', 0n, 'pledge1', true ],
                    [ 'tester2', 0n, 'pledge2', true ],
                    [ 'tester3', 0n, 'pledge3', true ]
                ]);
            });

            it("異常系", async function () {
                const { account0, election } = await loadFixture(setUpLoadFixture);
                await expect(election.connect(account0).getCandidates()).to.be.revertedWith("No candidates available");
            });
        });
    });
})