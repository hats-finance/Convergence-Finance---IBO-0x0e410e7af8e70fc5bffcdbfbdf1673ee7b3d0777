const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised).should();
const expect = chai.expect;
const {bedTestVestingDistributeInitTokens, bedTestVestingMintWlTokens, bedTestVestingMintSeedTokens, bedTestIboMinting} = require("../../Beds/bedTest-vesting");
const {REAL_VESTING_SCHEDULES} = require("../../../scripts/config");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployPresaleVestingFixture} = require("../../fixtures/fixtures");

describe("Vesting Cvg / Create vesting schedule", () => {
    let presaleContractSeed, presaleContractWl, vestingContract, iboContract;
    let owner, user1, treasuryDao;

    before(async () => {
        //we deploy the contracts
        const {contracts, users} = await loadFixture(deployPresaleVestingFixture);
        await bedTestVestingDistributeInitTokens(contracts, users);

        // reference for code simplification below
        dai = contracts.tokenContracts.daiContract;
        frax = contracts.tokenContracts.fraxContract;
        cvg = contracts.cvgContract;

        iboContract = contracts.iboContract;

        presaleContractWl = contracts.presaleContractWl;
        vestingContract = contracts.vestingContract;
        owner = users.owner;
        user1 = users.user1;
        treasuryDao = users.treasuryDao;

        await presaleContractWl.connect(treasuryDao).setSaleState(1);
        await bedTestVestingMintWlTokens(contracts, users);
        await bedTestVestingMintSeedTokens(contracts, users);
        await bedTestIboMinting(contracts, users);
        presaleContractSeed = contracts.presaleContractSeed;
    });

    it("Fails creating a vesting schedule if sale not finished", async () => {
        const totalAmount = await presaleContractSeed.connect(owner).totalCvgPreseed();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore;

        await expect(
            vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.totalCvgAmount,
                    start,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.type,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.dropCliff
                )
        ).to.be.revertedWith("PRESALE_ROUND_NOT_FINISHED");
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

    it("Fails creating a vesting schedule if not the contract Owner", async () => {
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await expect(
            vestingContract
                .connect(user1)
                .createVestingSchedule(
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.totalCvgAmount,
                    start,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.type,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.dropCliff
                )
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Fails creating a vesting schedule if no totalAmount on this type", async () => {
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        await expect(
            vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    0,
                    start,
                    REAL_VESTING_SCHEDULES.WL.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.WL.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.WL.type,
                    REAL_VESTING_SCHEDULES.WL.dropCliff
                )
        ).to.be.revertedWith("LTE_AMOUNT");
    });

    it("Success : Create vesting schedule VC/PRESEED should compute right infoss", async () => {
        const totalAmount = await presaleContractSeed.totalCvgPreseed();
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

    it("Success : Create vesting schedule WL should compute right infos", async () => {
        const totalAmountWl = await presaleContractWl.getTotalCvg();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example

        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                totalAmountWl,
                start,
                REAL_VESTING_SCHEDULES.WL.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.WL.daysAfterCliff,
                REAL_VESTING_SCHEDULES.WL.type,
                REAL_VESTING_SCHEDULES.WL.dropCliff
            );
        const vestingInfo = await vestingContract.vestingSchedules(2);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmountWl);
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

    // Create vesting schedule X with totalAmount > CVGbalance of vesting SC should be reverted
    it("Fails : Create vesting schedule X with totalAmount > CVGbalance of vesting SC should be reverted", async () => {
        const hugeAmount = "10000000000000000000000000000000000000000000000";
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        const daysBeforeCliff = 0; //for the example
        const typeVesting = 3; // WL_L TYPE
        const dropCliff = 125; // 12.5% drop at daysBeforeCliff
        await vestingContract
            .connect(treasuryDao)
            .createVestingSchedule(
                hugeAmount,
                start,
                REAL_VESTING_SCHEDULES.WL.daysBeforeCliff,
                REAL_VESTING_SCHEDULES.WL.daysAfterCliff,
                REAL_VESTING_SCHEDULES.WL.type,
                REAL_VESTING_SCHEDULES.WL.dropCliff
            )
            .should.be.revertedWith("AMOUNT");
    });

    it("Fails : Revoking vesting schedule 1", async () => {
        await vestingContract.revokeVestingSchedule(1).should.be.revertedWith("Ownable: caller is not the owner");
    });

    //TODO Why this changes in full test running ?
    it("Success : Revoking vesting schedule 1", async () => {
        expect(await vestingContract.vestingSchedulesTotalAmount()).to.be.eq("3517348484848484848484846");
        await vestingContract.connect(treasuryDao).revokeVestingSchedule(1);
        expect(await vestingContract.vestingSchedulesTotalAmount()).to.be.eq("17348484848484848484846");

        expect((await vestingContract.vestingSchedules(1)).revoked).to.be.eq(true);
    });

    it("Fails : Revoking vesting schedule 1", async () => {
        await vestingContract.connect(treasuryDao).revokeVestingSchedule(1).should.be.revertedWith("IRREVOCABLE");
    });
});
