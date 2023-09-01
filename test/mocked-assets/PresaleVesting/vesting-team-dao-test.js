const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const {REAL_VESTING_SCHEDULES} = require("../../../scripts/config");
const {MAX_INTEGER, zeroAddress} = require("@nomicfoundation/ethereumjs-util");
const {bedTestIboMinting, bedTestVestingDistributeInitTokens} = require("../../Beds/bedTest-vesting");

chai.use(chaiAsPromised).should();
const expect = chai.expect;

const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {deployPresaleVestingFixture} = require("../../fixtures/fixtures");

describe("Vesting Team/Dao Cvg / Release tests", () => {
    let cvg, presaleContractSeed, presaleContractWl, vestingContract;
    let owner, user1, user3, user5, user7, user8, user9, user10, user11, treasuryDao;

    let TEAM, DAO;
    const daysBeforeCliffTeamDao = 180; //86400*180 days

    const daysAfterCliffTeamCliffDao = 18 * 30;
    before(async () => {
        const {contracts, users} = await loadFixture(deployPresaleVestingFixture);

        cvg = contracts.cvgContract;
        presaleContractSeed = contracts.presaleContractSeed;
        presaleContractWl = contracts.presaleContractWl;
        vestingContract = contracts.vestingContract;
        owner = users.owner;
        user1 = users.user1;
        user3 = users.user3;
        user5 = users.user5;
        user7 = users.user7;
        user8 = users.user8;
        user9 = users.user9;
        user10 = users.user10;
        user11 = users.user11;
        treasuryDao = users.treasuryDao;

        TEAM = user7;
        DAO = user8;
        await bedTestIboMinting(contracts, users);

        await bedTestVestingDistributeInitTokens(contracts, users);
    });

    it("Success close the sale state of both WL & Presale", async () => {
        await vestingContract.setWhitelistTeam(user1.address).should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Success close the sale state of both WL & Presale", async () => {
        await vestingContract.setWhitelistDao(user1.address).should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Success close the sale state of both WL & Presale", async () => {
        const multisigMainnet = "0xfc15A25457A07fDb8fA226ec755164d04878392b";
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [multisigMainnet],
        });

        await owner.sendTransaction({
            to: multisigMainnet,
            value: ethers.parseEther("1.0"), // Sends exactly 1.0 ether
        });
        await presaleContractSeed.connect(await ethers.getSigner(multisigMainnet)).setSaleState(3);
        await hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [multisigMainnet],
        });
        await presaleContractWl.connect(treasuryDao).setSaleState(2);
        expect(await presaleContractSeed.saleState()).to.be.equal(3);
        expect(await presaleContractWl.saleState()).to.be.equal(2);
    });

    it("Create vesting schedule TEAM with wrong total amount should revert", async () => {
        const totalAmount = "12850000000000000000000000";
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await expect(
            vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    totalAmount,
                    start,
                    REAL_VESTING_SCHEDULES.TEAM.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.TEAM.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.TEAM.type,
                    REAL_VESTING_SCHEDULES.TEAM.dropCliff
                )
        ).to.be.revertedWith("WRONG_AMOUNT_TEAM");
    });
    it("Create vesting schedule DAO with wrong total amount should revert", async () => {
        const totalAmount = "16000000000000000000000000";
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await expect(
            vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    totalAmount,
                    start,
                    REAL_VESTING_SCHEDULES.DAO.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.DAO.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.DAO.type,
                    REAL_VESTING_SCHEDULES.DAO.dropCliff
                )
        ).to.be.revertedWith("WRONG_AMOUNT_DAO");
    });

    it("Create vesting schedule TEAM should compute right infos", async () => {
        const totalAmount = "12750000000000000000000000";
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                totalAmount,
                start,
                REAL_VESTING_SCHEDULES.TEAM.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.TEAM.daysAfterCliff,
                REAL_VESTING_SCHEDULES.TEAM.type,
                REAL_VESTING_SCHEDULES.TEAM.dropCliff
            );
        const vestingInfo = await vestingContract.vestingSchedules(1);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmount);
    });
    it("Create vesting schedule DAO should compute right infos", async () => {
        const totalAmount = "15000000000000000000000000";
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                totalAmount,
                start,
                REAL_VESTING_SCHEDULES.DAO.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.DAO.daysAfterCliff,
                REAL_VESTING_SCHEDULES.DAO.type,
                REAL_VESTING_SCHEDULES.DAO.dropCliff
            );
        const vestingInfo = await vestingContract.vestingSchedules(2);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmount);
        expect(await vestingContract.getWithdrawableAmount()).to.be.equal("12750000000000000000000000"); //rest of vesting
    });

    it("Set Team and Dao address for vesting", async () => {
        await vestingContract.connect(treasuryDao).setWhitelistTeam(TEAM.address);
        await vestingContract.connect(treasuryDao).setWhitelistDao(DAO.address);
        expect(await vestingContract.whitelistedTeam()).to.be.equal(TEAM.address);
        expect(await vestingContract.whitelistedDao()).to.be.equal(DAO.address);
    });

    ///////////////////////////////RELEASE TOKEN///////////////////////////////
    it("Try to release DAO before begining of vesting should revert", async () => {
        await vestingContract.connect(DAO).releaseTeamOrDao(false).should.be.revertedWith("NOT_RELEASABLE");
    });
    it("begin vesting (+1000)", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [1000]);
        await hre.network.provider.send("hardhat_mine", []);
    });
    it("release for TEAM should be reverted", async () => {
        await vestingContract.connect(TEAM).releaseTeamOrDao(true).should.be.revertedWith("NOT_RELEASABLE");
    });

    it("try to release with DAO and param isTeam == true should revert", async () => {
        await vestingContract.connect(TEAM).releaseTeamOrDao(false).should.be.revertedWith("NOT_DAO");
    });

    it("release daysBeforeCliff for DAO should compute right infos", async () => {
        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("750000000000000000000000", ethers.parseEther("3"));
    });

    it("Go to day 10", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [10 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true).should.be.revertedWith("NOT_RELEASABLE");

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("1013891646000000000000000", ethers.parseEther("2"));
    });
    it("Go to day 20", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [10 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true).should.be.revertedWith("NOT_RELEASABLE");

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("1277781453750000000000000", ethers.parseEther("2"));
    });

    it("Go to day 30", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [10 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true).should.be.revertedWith("NOT_RELEASABLE");

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("1541670948000000000000000", ethers.parseEther("1"));
    });

    it("Go to day 90", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [60 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true).should.be.revertedWith("NOT_RELEASABLE");

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("3125004593250000000000000", ethers.parseEther("1"));
    });

    it("Go to day 179", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [89 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true).should.be.revertedWith("NOT_RELEASABLE");

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("5473616305500000000000000", ethers.parseEther("1"));
    });

    it("Go to day 180, unlock cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [1 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("637500000000000000000000", ethers.parseEther("10"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("5500005809250000000000000", ethers.parseEther("1"));
    });

    it("Go to day 300 => 6 months after DAO cliff & 4 months after cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [4 * 30 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("3329172126712500000000000", ethers.parseEther("5"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("8666673085500000000000000", ethers.parseEther("1"));
    });

    it("Go to day 480 => 12 months after DAO cliff & 10 months after cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [6 * 30 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("7366672643512500000000000", ethers.parseEther("5"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("13416673693500000000000000", ethers.parseEther("1"));
    });

    it("Go to day 540 => 14 months after DAO cliff & 12 months after cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [2 * 30 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("8712506241975000000000000", ethers.parseEther("5"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false);
        expect(await cvg.balanceOf(DAO.address)).to.be.approximately("15000000000000000000000000", ethers.parseEther("1"));
    });

    it("Go to day 569 => 15 months after DAO cliff & 13 months after cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [29 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("9362993131875000000000000", ethers.parseEther("50"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false).should.be.revertedWith("NOT_RELEASABLE");
    });

    it("Go to day 570 => end of the vesting DAO & 13 months after cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [1 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("9385424197950000000000000", ethers.parseEther("5"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false).should.be.revertedWith("NOT_RELEASABLE");
    });

    it("Go to day 660 => end of the vesting DAO & 16 months after cliff TEAM", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [3 * 30 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("11404174456350000000000000", ethers.parseEther("5"));

        await vestingContract.connect(DAO).releaseTeamOrDao(false).should.be.revertedWith("NOT_RELEASABLE");
    });

    it("Go to day 719 => end of the vesting DAO & 18 months after cliff TEAM, 1 day before the end of the vesting", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [59 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(TEAM.address)).to.be.approximately("12727578018300000000000000", ethers.parseEther("5")); //+1187499999999999999744000

        await vestingContract.connect(DAO).releaseTeamOrDao(false).should.be.revertedWith("NOT_RELEASABLE");
    });

    it("Go to day 720 => end of both vesting", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [30 * 86_400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(TEAM).releaseTeamOrDao(true);
        expect(await cvg.balanceOf(DAO.address)).to.be.eq("15000000000000000000000000");
        expect(await cvg.balanceOf(TEAM.address)).to.be.eq("12750000000000000000000000");
    });
});
/*
TEAM
TOTAL = 12_750_000
daysBeforeCliff = 637_500 CVG
Totalslice = 12_112_500 CVG
perSlice = 1_009_375 CVG

daysBeforeCliff (180) 5% = 750_000 CVG
slice 1 (225)= 1_009_375 CVG
slice 2 (270)= 1_009_375 CVG
slice 3 (315)= 1_009_375 CVG
slice 4 (360)= 1_009_375 CVG
slice 5 (405)= 1_009_375 CVG
slice 6 (450)= 1_009_375 CVG
slice 7 (495)= 1_009_375 CVG
slice 8 (540)= 1_009_375 CVG
slice 9 (585)= 1_009_375 CVG
slice 10 (630)= 1_009_375 CVG
slice 11 (675)= 1_009_375 CVG
slice 12 (720)= 1_009_375 CVG

DAO
TOTAL = 15_000_000
daysBeforeCliff = 750_000 CVG
Totalslice = 14_250_000
perSlice = 1_187_500 CVG
18 mois vesting (540 days) = 1cliff at day 0 + 12 * 45 days

daysBeforeCliff (0) 5% = 750_000 CVG
slice 1 (45)= 1_187_500 CVG
slice 2 (90)= 1_187_500 CVG
slice 3 (135)= 1_187_500 CVG
slice 4 (180)= 1_187_500 CVG
slice 5 (225)= 1_187_500 CVG
slice 6 (270)= 1_187_500 CVG
slice 7 (315)= 1_187_500 CVG
slice 8 (360)= 1_187_500 CVG
slice 9 (405)= 1_187_500 CVG
slice 10 (450)= 1_187_500 CVG
slice 11 (495)= 1_187_500 CVG
slice 12 (540)= 1_187_500 CVG

*/
