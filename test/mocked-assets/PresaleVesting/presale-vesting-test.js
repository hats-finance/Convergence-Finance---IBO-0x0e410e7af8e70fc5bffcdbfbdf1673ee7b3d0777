const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestHelper = require("../../TestHelper");
chai.use(chaiAsPromised).should();
const expect = chai.expect;
const {bedTestVestingDistributeInitTokens, bedTestVestingMintWlTokens, bedTestIboMinting} = require("../../Beds/bedTest-vesting");
const {REAL_VESTING_SCHEDULES} = require("../../../scripts/config");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployPresaleVestingFixture} = require("../../fixtures/fixtures");

describe("Vesting Cvg / Release tests", () => {
    let cvg, presaleContractSeed, presaleContractWl, vestingContract, iboContract;
    let owner, user1, user3, user5, user7, user8, user4, user10;
    let treasuryDao;

    before(async () => {
        const {contracts, users} = await loadFixture(deployPresaleVestingFixture);

        await bedTestVestingDistributeInitTokens(contracts, users);

        cvg = contracts.cvgContract;
        presaleContractSeed = contracts.presaleContractSeed;
        presaleContractWl = contracts.presaleContractWl;
        vestingContract = contracts.vestingContract;
        iboContract = contracts.iboContract;
        owner = users.owner;
        user1 = users.user1;
        user3 = users.user3;
        user4 = users.user4;

        user5 = users.user5;
        user7 = users.user7;
        user8 = users.user8;
        user4 = users.user4;
        user10 = users.user10;
        user1 = users.user1;
        treasuryDao = users.treasuryDao;

        await presaleContractWl.connect(treasuryDao).setSaleState(1);
        await bedTestVestingMintWlTokens(contracts, users);
        await bedTestIboMinting(contracts, users);
    });
    it("withdraw funds presale wl", async () => {
        await presaleContractWl.connect(treasuryDao).withdrawFunds();
    });
    it("withdraw funds presale wl with zero balance should revert", async () => {
        await expect(presaleContractWl.connect(treasuryDao).withdrawFunds()).to.be.revertedWith("NO_FUNDS");
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
    });

    it("Create vesting schedule VC/PRESEED should compute right infos", async () => {
        const totalAmount = await presaleContractSeed.getTotalCvg();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                totalAmount,
                start,
                REAL_VESTING_SCHEDULES.PRESEED_SEED.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.PRESEED_SEED.daysAfterCliff,
                REAL_VESTING_SCHEDULES.PRESEED_SEED.type,
                REAL_VESTING_SCHEDULES.PRESEED_SEED.dropCliff
            );
        const vestingInfo = await vestingContract.vestingSchedules(1);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmount);
    });

    it("Create vesting schedule WL should compute right infos", async () => {
        const totalAmount = await presaleContractSeed.totalCvgPreseed();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                totalAmount,
                start,
                REAL_VESTING_SCHEDULES.WL.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.WL.daysAfterCliff,
                REAL_VESTING_SCHEDULES.WL.type,
                REAL_VESTING_SCHEDULES.WL.dropCliff
            );
        const vestingInfo = await vestingContract.vestingSchedules(2);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmount);
    });

    it("Success : Create vesting schedule IBO should compute right infos", async () => {
        const totalAmountIbo = await iboContract.getTotalCvgDue();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example

        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                totalAmountIbo,
                start,
                REAL_VESTING_SCHEDULES.IBO.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.IBO.daysAfterCliff,
                REAL_VESTING_SCHEDULES.IBO.type,
                REAL_VESTING_SCHEDULES.IBO.dropCliff
            );
        const vestingInfo = await vestingContract.vestingSchedules(3);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmountIbo);
    });

    it("Verify : Computation of total Cvg ", async () => {
        const totalCvg = await presaleContractWl.getTotalCvg();
        expect(totalCvg).to.be.eq("15454545454545454545453");
    });

    ///////////////////////////////RELEASE TOKEN///////////////////////////////
    it("Seed first token try release before releaseTime should be reverted", async () => {
        const fistTokenOwner = await presaleContractSeed.ownerOf(1);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [fistTokenOwner],
        });
        await expect(vestingContract.connect(await ethers.getSigner(fistTokenOwner)).releaseSeed(1)).to.be.revertedWith("NOT_RELEASABLE");

        await hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [fistTokenOwner],
        });
    });

    it("Seed second token try release before releaseTime should be reverted", async () => {
        const secondTokenOwner = await presaleContractSeed.ownerOf(2);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [secondTokenOwner],
        });
        await expect(vestingContract.connect(await ethers.getSigner(secondTokenOwner)).releaseSeed(2)).to.be.revertedWith("NOT_RELEASABLE");

        await hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [secondTokenOwner],
        });
    });

    it("Try to releaseSeed a token not owned", async () => {
        await expect(vestingContract.connect(user4).releaseSeed(1)).to.be.revertedWith("NOT_OWNED");
    });

    it("Try to releaseWl a token not owned", async () => {
        await expect(vestingContract.connect(user4).releaseWl(1)).to.be.revertedWith("NOT_OWNED");
    });

    it("WL_S (7) Try to release before releaseTime1 should be reverted", async () => {
        await expect(vestingContract.connect(user7).releaseWl(1)).to.be.revertedWith("NOT_RELEASABLE");
    });

    it("WL_M (4) Try to release before releaseTime1 should be reverted", async () => {
        await expect(vestingContract.connect(user4).releaseWl(2)).to.be.revertedWith("NOT_RELEASABLE");
    });

    it("WL_L (1) Try to release before releaseTime1 should be reverted", async () => {
        await expect(vestingContract.connect(user1).releaseWl(3)).to.be.revertedWith("NOT_RELEASABLE");
    });

    it("WL_S (7)  release after begin of schedule should change balances", async () => {
        expect(await cvg.balanceOf(user7.address)).to.be.equal("0");
        //IncreaseTime + Mine the last block to be effective
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;

        await hre.network.provider.send("evm_increaseTime", [1000]);
        await hre.network.provider.send("hardhat_mine", []);
        await vestingContract.connect(user7).releaseWl(1);
        const timestampAfter = (await ethers.provider.getBlock("latest")).timestamp;

        const vesting0 = (await presaleContractWl.connect(user7).presaleInfos(1)).cvgAmount; // 909.09 total for 7
        const percentCliff = (await vestingContract.connect(user7).vestingSchedules(2)).dropCliff;
        const amountDropCliff = (vesting0 * percentCliff) / 1000n;

        expect(await cvg.balanceOf(user7.address)).to.be.approximately(amountDropCliff, ethers.parseEther("0.001")); //Release drop daysBeforeCliff
    });

    it("WL_M (4) try to release after begin of schedule should change balances", async () => {
        expect(await cvg.balanceOf(user4.address)).to.be.equal("0");
        await vestingContract.connect(user4).releaseWl(2);

        const vesting0 = (await presaleContractWl.connect(user4).presaleInfos(2)).cvgAmount; // 5454,54 total for 4

        const percentCliff = (await vestingContract.connect(user4).vestingSchedules(2)).dropCliff;
        const amountDropCliff = (vesting0 * percentCliff) / 1000n;
        expect(await cvg.balanceOf(user4.address)).to.be.approximately(amountDropCliff, ethers.parseEther("0.1"));
    });

    it("Success : Claiming CVG dust on the iboContract", async () => {
        expect(await cvg.balanceOf(user10.address)).to.be.equal("0");
        await vestingContract.connect(user10).releaseIbo(1);
        expect(await cvg.balanceOf(user10.address)).to.be.approximately(0, ethers.parseEther("0.01"));
    });

    // DAY 15
    it("Success : Claiming 1/6 of CVG on an IBO token", async () => {
        await hre.network.provider.send("evm_increaseTime", [15 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);

        expect(await cvg.balanceOf(user10.address)).to.be.approximately("0", ethers.parseEther("0.01"));
        await vestingContract.connect(user10).releaseIbo(1);

        const totalCvgVested = await iboContract.totalCvgPerToken(1);

        expect(await cvg.balanceOf(user10.address)).to.be.approximately(totalCvgVested / 4n, ethers.parseEther("0.1"));
    });

    // DAY 30

    it("WL_S (7) releaseWl releaseTime1 should change balances", async () => {
        const amountAfter30Days = BigInt("503031399799999999999");
        await hre.network.provider.send("evm_increaseTime", [15 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);

        await vestingContract.connect(user7).releaseWl(1);
        expect(await cvg.balanceOf(user7.address)).to.be.approximately(amountAfter30Days, ethers.parseEther("0.1"));
    });

    it("WL_M (4) releaseWl after releaseTime1 should change balances", async () => {
        const amountAfter30Days = BigInt("3018188398799999999999");
        await vestingContract.connect(user4).releaseWl(2);
        expect(await cvg.balanceOf(user4.address)).to.be.approximately(amountAfter30Days, ethers.parseEther("0.1"));
    });

    it("Success : Claiming 1/3 of CVG on an IBO token", async () => {
        const totalCvgVested = await iboContract.totalCvgPerToken(1);

        expect(await cvg.balanceOf(user10.address)).to.be.approximately(totalCvgVested / 4n, ethers.parseEther("0.01"));
        await vestingContract.connect(user10).releaseIbo(1);

        expect(await cvg.balanceOf(user10.address)).to.be.approximately(totalCvgVested / 2n, ethers.parseEther("0.1"));
    });
    // DAY 89

    it("WL_S (7) releaseWl after releaseTime2 should change balances", async () => {
        const amountAfter89Days = BigInt("902324485899999999999");
        await hre.network.provider.send("evm_increaseTime", [59 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);
        await vestingContract.connect(user7).releaseWl(1);
        expect(await cvg.balanceOf(user7.address)).to.be.approximately(amountAfter89Days, ethers.parseEther("0.1"));
    });

    it("WL_M (4) releaseWl after releaseTime2 should change balances", async () => {
        const amountAfter89Days = BigInt("5413946915399999999999");
        await vestingContract.connect(user4).releaseWl(2);
        expect(await cvg.balanceOf(user4.address)).to.be.approximately(amountAfter89Days, ethers.parseEther("0.1"));
    });

    it("WL_L (1) releaseWl after releaseTime2 should change balances", async () => {
        const amountAfter89Days = BigInt("9023244858999999999999");
        await vestingContract.connect(user1).releaseWl(3);
        expect(await cvg.balanceOf(user1.address)).to.be.approximately(amountAfter89Days, ethers.parseEther("0.1"));
    });

    it("Success : Claiming almost all of CVG on an IBO token", async () => {
        const totalCvgVested = await iboContract.totalCvgPerToken(1);

        expect(await cvg.balanceOf(user10.address)).to.be.approximately("946975178030303030302", ethers.parseEther("0.01"));
        await vestingContract.connect(user10).releaseIbo(1);

        expect(await cvg.balanceOf(user10.address)).to.be.eq(totalCvgVested);
    });

    // DAY 90

    it("WL_S (7) end of vesting, claim all", async () => {
        const fullAmount = (await presaleContractWl.presaleInfos(1)).cvgAmount;
        await hre.network.provider.send("evm_increaseTime", [59 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);
        await vestingContract.connect(user7).releaseWl(1);
        expect(await cvg.balanceOf(user7.address)).to.be.eq(fullAmount);
    });

    it("WL_M (4) end of vesting, claim all", async () => {
        const fullAmount = (await presaleContractWl.presaleInfos(2)).cvgAmount;
        await vestingContract.connect(user4).releaseWl(2);
        expect(await cvg.balanceOf(user4.address)).to.be.eq(fullAmount);
    });

    it("WL_L (1) end of vesting, claim all", async () => {
        const fullAmount = (await presaleContractWl.presaleInfos(3)).cvgAmount;
        await vestingContract.connect(user1).releaseWl(3);
        expect(await cvg.balanceOf(user1.address)).to.be.eq(fullAmount);
    });

    it("Success : Claiming all of CVG on an IBO token", async () => {
        const totalCvgVested = await iboContract.totalCvgPerToken(1);

        expect(await cvg.balanceOf(user10.address)).to.be.eq(totalCvgVested);
    });

    // DAY 120

    it("Go at end of seed cliff & Success claiming cliff of token 1 on Seed", async () => {
        await hre.network.provider.send("evm_increaseTime", [30 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);
        const amountAfterCliff = 129333791550000000000000n;

        const firstTokenOwner = await presaleContractSeed.ownerOf(1);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [firstTokenOwner],
        });

        await vestingContract.connect(await ethers.getSigner(firstTokenOwner)).releaseSeed(1);

        expect(await cvg.balanceOf(firstTokenOwner)).to.be.approximately(amountAfterCliff, ethers.parseEther("1"));
    });

    it("Success Get the vesting information of a presale token", async () => {
        const t1 = await vestingContract.getInfoVestingTokenId(1, 1);
        expect(t1.vestingScheduleId).to.be.eq("1");
        expect(t1.amountReleasable).to.be.eq("0");
        expect(t1.totalCvg).to.be.eq("750000000000000000000000");
        expect(t1.amountRedeemed).to.be.approximately(129333791550000000000000n, ethers.parseEther("1"));
    });

    it("WL_S (7) try to release, but nothing to release ", async () => {
        await expect(vestingContract.connect(user7).releaseWl(1)).to.be.revertedWith("NOT_RELEASABLE");
    });

    it("WL_M (4) try to release, but nothing to release", async () => {
        await expect(vestingContract.connect(user4).releaseWl(2)).to.be.revertedWith("NOT_RELEASABLE");
    });

    // GETTERS

    it("Success Get the Total CVG released by the vesting schedule", async () => {
        const v1 = await vestingContract.getTotalReleasedScheduleId(1);
        expect(v1).to.be.approximately(129333791550000000000000n, ethers.parseEther("1"));
    });

    // DAY 190
    it("Go in day 190", async () => {
        await hre.network.provider.send("evm_increaseTime", [70 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);
    });

    it("Success claiming  Seed in day 190", async () => {
        const amountday190 = 240167180062500000000000n; // 37500 = 750 000 * (1/20) tokens dropped at cliffs

        const firstTokenOwner = await presaleContractSeed.ownerOf(1);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [firstTokenOwner],
        });
        await vestingContract.connect(await ethers.getSigner(firstTokenOwner)).releaseSeed(1);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [firstTokenOwner],
        });

        expect(await cvg.balanceOf(firstTokenOwner)).to.be.approximately(amountday190, ethers.parseEther("1")); // 148_333
    });

    it("Success claiming ALL of token 2 on Seed in day 190", async () => {
        const amountday190 = 98628662886600000000000n;

        const secondTokenOwner = await presaleContractSeed.ownerOf(2);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [secondTokenOwner],
        });
        await vestingContract.connect(await ethers.getSigner(secondTokenOwner)).releaseSeed(2);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [secondTokenOwner],
        });
        expect(await cvg.balanceOf(secondTokenOwner)).to.be.approximately(amountday190, ethers.parseEther("1")); /// 60_915,75
    });

    // DAY 480
    it("Go in day 480, end of vesting seed", async () => {
        await hre.network.provider.send("evm_increaseTime", [380 * 86400]);
        await hre.network.provider.send("hardhat_mine", []);
    });

    it("Success claiming  All of token 1", async () => {
        const amountFull = BigInt("750000000000000000000000");

        const firstTokenOwner = await presaleContractSeed.ownerOf(1);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [firstTokenOwner],
        });
        await vestingContract.connect(await ethers.getSigner(firstTokenOwner)).releaseSeed(1);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [firstTokenOwner],
        });

        expect(await cvg.balanceOf(firstTokenOwner)).to.be.eq(amountFull); // 148_333
    });

    it("Success claiming  All of token 2", async () => {
        const amountFull = BigInt("308000000000000000000000"); // 37_500 = 750 000 * (1/20) tokens dropped at cliffs

        const secondTokenOwner = await presaleContractSeed.ownerOf(2);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [secondTokenOwner],
        });
        await vestingContract.connect(await ethers.getSigner(secondTokenOwner)).releaseSeed(2);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [secondTokenOwner],
        });
        expect(await cvg.balanceOf(secondTokenOwner)).to.be.eq(amountFull); /// 60_915,75
    });

    it("Fails : Withdrawing with a random user", async () => {
        await vestingContract.connect(user1).withdrawOnlyExcess("100000000").should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Tries to withdraw only excess with amount 0", async () => {
        await vestingContract.connect(treasuryDao).withdrawOnlyExcess(0).should.be.revertedWith("LTE");
    });

    it("Tries to withdraw only excess with exceeding amount", async () => {
        const withdrawableAmount = await vestingContract.getWithdrawableAmount();
        await vestingContract
            .connect(treasuryDao)
            .withdrawOnlyExcess(withdrawableAmount + 1n)
            .should.be.revertedWith("EXCEEDS_WITHDRAWABLE_AMOUNT");
    });

    it("Withdraws only excess from contract", async () => {
        const amount = ethers.parseEther("1000000");
        const ownerBalance = await cvg.balanceOf(treasuryDao.address);

        await vestingContract.connect(treasuryDao).withdrawOnlyExcess(amount);

        expect(await cvg.balanceOf(treasuryDao.address)).to.be.equal(ownerBalance + amount);
    });
});
