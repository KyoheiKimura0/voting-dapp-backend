import {Signer} from 'ethers';
import {ethers as hardhatEthers} from 'hardhat';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {VoteProject} from "../../typechain-types";
import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';

chai.use(chaiAsPromised);

describe("========= VoteProject =========", function() {
    const setUpLoadFixture = async () => {
        const [account0, account1, account2, account3]: Signer[] = await hardhatEthers.getSigners();
        const VotingFactory = await hardhatEthers.getContractFactory("VoteProject");
        const voteProject: VoteProject = await VotingFactory.deploy() as VoteProject;
        await voteProject.waitForDeployment();

        return { account0, account1, account2, account3, voteProject };
    };

    const setUpLoadFixtureCreateProject = async () => {
        const [account0, account1, account2, account3]: Signer[] = await hardhatEthers.getSigners();
        const VotingFactory = await hardhatEthers.getContractFactory("VoteProject");
        const voteProject: VoteProject = await VotingFactory.deploy() as VoteProject;
        await voteProject.waitForDeployment();

        const name = "Test Project1";
        const description = "This is a test project1";
        const now = Math.floor(Date.now() / 1000); // current timestamp in seconds
        const oneWeekFromNow = now + 60 * 60 * 24 * 7; // one week from now
        let projectId : string = "0x8123958d4a2881afd7a212b3e2e97547ee6934627bb46720fc824b2b655b6cf8";

        const event = voteProject.getEvent('ProjectCreated');

        voteProject.on(event, (pId)  => {
            //イベントが発火したら、projectIdに値をセットする
            projectId = pId;
        });

        const tx = await voteProject.connect(account0).createProject(name, description, now, oneWeekFromNow);
        await tx.wait();

        //1秒待つ(voteProject.onが非同期で動いているため)
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(projectId);
        const project = await voteProject.getProject(projectId);

        return { account0, account1, account2, account3, voteProject, project };
    }

    describe("[投票プロジェクト作成]", async function() {
        it("正常系",async function () {
            const { account0, voteProject } = await loadFixture(setUpLoadFixture);
            // Define the project details
            const name = "Test Project";
            const description = "This is a test project";
            const now = Math.floor(Date.now() / 1000); // current timestamp in seconds
            const oneWeekFromNow = now + 60 * 60 * 24 * 7; // one week from now
            let projectId : string = "0x8123958d4a2881afd7a212b3e2e97547ee6934627bb46720fc824b2b655b6cf8";

            const event = voteProject.getEvent('ProjectCreated');

            voteProject.once(event, (pId)  => {
                //イベントが発火したら、projectIdに値をセットする
                projectId = pId;
            });

            const tx = await voteProject.connect(account0).createProject(name, description, now, oneWeekFromNow);
            await tx.wait();
            console.log(projectId);
            voteProject.off(event);

            const project = await voteProject.getProject(projectId);
            expect(project.name).to.equal(name);
            expect(project.description).to.equal(description);
            expect(project.from).to.equal(BigInt(now));
            expect(project.to).to.equal(BigInt(oneWeekFromNow));
        }).timeout(10000);
    });

    describe("[投票プロジェクトの更新]", async function() {
        it("正常系",async function () {
            const { account0,  voteProject, project } = await loadFixture(setUpLoadFixtureCreateProject);
            const newName = "update test";
            const newDescription = "This is the updated description";
            const newFrom = project.from + 60n * 60n * 24n * 7n; // one week from now
            const newTo = project.to + 60n * 60n * 24n * 14n; // two weeks from now

            await expect(voteProject.connect(account0).updateProject(project.projectId, newName,newDescription, newFrom, newTo))
                .to.be.emit(voteProject, 'ProjectUpdated').withArgs(project.projectId, newName, newDescription, newFrom, newTo);

            const newProject = await voteProject.getProject(project.projectId);
            expect(newProject.name).to.equal(newName);
            expect(newProject.description).to.equal(newDescription);
            expect(newProject.from).to.equal(BigInt(newFrom));
            expect(newProject.to).to.equal(BigInt(newTo));

        }).timeout(10000);

        it("異常系：非アクティブ",async function () {
            const { account0, account1,  voteProject, project } = await loadFixture(setUpLoadFixtureCreateProject);
            const newName = "update test";
            const newDescription = "This is the updated description";
            const newFrom = project.from + 60n * 60n * 24n * 7n; // one week from now
            const newTo = project.to + 60n * 60n * 24n * 14n; // two weeks from now

            await voteProject.connect(account0).closeProject(project.projectId);
            await expect(voteProject.connect(account1).updateProject(project.projectId, newName,newDescription, newFrom, newTo))
                .to.be.revertedWithCustomError(voteProject,"ProjectNotActive");
        });
    });

    describe("[投票プロジェクトのクローズ]", async function() {
        it("正常系",async function () {
            const { account0,  voteProject, project } = await loadFixture(setUpLoadFixtureCreateProject);
            await expect(voteProject.connect(account0).closeProject(project.projectId))
                .to.be.emit(voteProject, 'ProjectClosed').withArgs(project.projectId);
        }).timeout(10000);
    });

    describe("[投票プロジェクト全アクティブ取得]", async function() {
        it("正常系",async function () {
            const { account0,  voteProject, project } = await loadFixture(setUpLoadFixtureCreateProject);
            const newFrom = project.from + 60n * 60n * 24n * 7n; // one week from now
            const newTo = project.to + 60n * 60n * 24n * 14n; // two weeks from now
            const tx = await voteProject.connect(account0).createProject("test", "test2", newTo, newFrom);
            await tx.wait();

            const projects = await voteProject.getActiveProjects();
            expect(projects.length).to.equal(2);
        }).timeout(10000);
    });
});