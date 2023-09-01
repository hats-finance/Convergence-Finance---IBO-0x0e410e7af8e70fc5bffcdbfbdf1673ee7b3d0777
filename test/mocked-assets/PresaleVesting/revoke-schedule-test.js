const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised).should();
const expect = chai.expect;
const {bedTestVestingDistributeInitTokens, bedTestVestingMintWlTokens, bedTestVestingMintSeedTokens, bedTestIboMinting} = require("../../Beds/bedTest-vesting");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployPresaleVestingFixture} = require("../../fixtures/fixtures");

describe("Vesting Cvg / Revoke vesting schedule", () => {
    let presaleContractSeed, presaleContractWl, vestingContract;
    let owner, user1, user7, treasuryDao;

    before(async () => {
        const {contracts, users} = await loadFixture(deployPresaleVestingFixture);

        await bedTestVestingDistributeInitTokens(contracts, users);

        // reference for code simplification below
        dai = contracts.tokenContracts.daiContract;
        frax = contracts.tokenContracts.fraxContract;
        cvg = contracts.cvgContract;

        presaleContractWl = contracts.presaleContractWl;
        vestingContract = contracts.vestingContract;
        owner = users.owner;
        user1 = users.user1;
        user7 = users.user7;
        treasuryDao = users.treasuryDao;

        await presaleContractWl.connect(treasuryDao).setSaleState(1);
        await bedTestVestingMintWlTokens(contracts, users);
        await bedTestVestingMintSeedTokens(contracts, users);
        await bedTestIboMinting(contracts, users);
        presaleContractSeed = contracts.presaleContractSeed;
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

    it("Create vesting schedule VC/PRESEED should compute right infoss", async () => {
        const totalAmount = await presaleContractSeed.totalCvgPreseed();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        const daysBeforeCliff = 3000; //for the example
        const typeVesting = 1; // VC/PRESEED TYPE
        const dropCliff = 50; // 5% drop at daysBeforeCliff
        await vestingContract.connect(treasuryDao).createVestingSchedule(totalAmount, start, daysBeforeCliff, 5, typeVesting, dropCliff);
        const vestingInfo = await vestingContract.vestingSchedules(1);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmount);
    });
    it("release before initiali should be reverted because schedule is revoked", async () => {
        await expect(vestingContract.connect(user7).releaseWl(1)).to.be.revertedWith("SCHEDULE_NOT_INIT");
    });

    it("Create vesting schedule WL should compute right infos", async () => {
        const totalAmount = await presaleContractSeed.totalCvgPreseed();
        const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;
        const start = timestampBefore + 1000; //for the example
        const daysBeforeCliff = 0; //for the example
        const typeVesting = 2; // WL_S TYPE
        const dropCliff = 500; // 50% drop at daysBeforeCliff
        await vestingContract.connect(treasuryDao).createVestingSchedule(totalAmount, start, daysBeforeCliff, 5, typeVesting, dropCliff);
        const vestingInfo = await vestingContract.vestingSchedules(2);
        expect(vestingInfo.totalAmount).to.be.equal(totalAmount);
    });

    it("Success : Revoking vesting schedule 2", async () => {
        expect(await vestingContract.vestingSchedulesTotalAmount()).to.be.eq("7000000000000000000000000");
        await vestingContract.connect(treasuryDao).revokeVestingSchedule(2);
        expect(await vestingContract.vestingSchedulesTotalAmount()).to.be.eq("3500000000000000000000000");

        expect((await vestingContract.vestingSchedules(2)).revoked).to.be.eq(true);
    });
    it("Increase time to cliffTime", async () => {
        //IncreaseTime + Mine the last block to be effective
        await hre.network.provider.send("evm_increaseTime", [1000]);
        await hre.network.provider.send("hardhat_mine", []);
    });
    it("release at cliffTime should be reverted because schedule is revoked", async () => {
        await expect(vestingContract.connect(user7).releaseWl(1)).to.be.revertedWith("VESTING_REVOKED");
    });
});
