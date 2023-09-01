const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployPresaleVestingFixture} = require("../../fixtures/fixtures");
chai.use(chaiAsPromised).should();
const expect = chai.expect;

describe("Vesting Cvg / Setters", () => {
    let dai, frax, cvg, presaleContractSeed, presaleContractWl, vestingContract;
    let owner, user1, user3, user5, user7, user8, user9, user10, user11;
    let treasuryDao;

    before(async () => {
        const {contracts, users} = await loadFixture(deployPresaleVestingFixture);

        // reference for code simplification below
        dai = contracts.tokenContracts.DAI;
        frax = contracts.tokenContracts.FRAX;
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

        wlAddressesS = contracts.wlAddressesS;
        wlAddressesM = contracts.wlAddressesM;
        wlAddressesL = contracts.wlAddressesL;
    });

    it("Success verify the constructor Seeds addresses", async () => {
        const presaleWlRetrieved = await vestingContract.presaleWl();
        const presaleSeedRetrieved = await vestingContract.presaleSeed();

        expect(presaleWlRetrieved).to.be.eq(await presaleContractWl.getAddress());
        expect(presaleSeedRetrieved.toLowerCase()).to.be.eq(await presaleContractSeed.getAddress());
    });

    it("Fails set presale as not the owner", async () => {
        await vestingContract.connect(user7).setPresale(presaleContractWl).should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Fails set PresaleSeed as not the owner", async () => {
        await vestingContract.connect(user7).setPresaleSeed(user10).should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Success changing presale address as the owner", async () => {
        await vestingContract.connect(treasuryDao).setPresale(user5);
        expect(await vestingContract.presaleWl()).to.be.eq(user5.address);
    });

    it("Success changing presale address as the owner", async () => {
        await vestingContract.connect(treasuryDao).setPresaleSeed(user10);
        expect(await vestingContract.presaleSeed()).to.be.eq(user10.address);
    });
});
