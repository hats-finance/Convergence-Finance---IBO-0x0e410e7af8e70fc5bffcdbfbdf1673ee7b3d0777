const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestHelper = require("../../TestHelper");
chai.use(chaiAsPromised).should();
const expect = chai.expect;

const {bedTestVestingDistributeInitTokens} = require("../../Beds/bedTest-vesting");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployPresaleVestingFixture} = require("../../fixtures/fixtures");

describe("Presale Wl", () => {
    let cvg, dai, presaleContractSeed, presaleContractWl, vestingContract;
    let owner, user1, user3, user5, user7, user8, user9, user10, user11;
    let treasuryDao;

    let contractsUsers, contracts, users;

    before(async () => {
        contractsUsers = await loadFixture(deployPresaleVestingFixture);
        contracts = contractsUsers.contracts;
        users = contractsUsers.users;

        await bedTestVestingDistributeInitTokens(contracts, users);

        cvg = contracts.cvgContract;
        dai = contracts.tokenContracts.daiContract;
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
    });
    it("invest with user 7 before start of presale should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("200"), true, 2)).to.be.revertedWith("PRESALE_NOT_STARTED");
    });
    it("go to OVER state presale wl", async () => {
        await presaleContractWl.connect(treasuryDao).setSaleState(2);
    });
    it("invest with user 7 when presale is OVER should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("200"), true, 2)).to.be.revertedWith("PRESALE_ROUND_FINISHED");
    });

    it("START presale wl", async () => {
        await presaleContractWl.connect(treasuryDao).setSaleState(1);
    });

    it("invest with user 7 before start of presale should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, "0", true, 2)).to.be.revertedWith("INVALID_AMOUNT");
    });
    it("invest with user 7 with wrong proof should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user8.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("200"), true, 2)).to.be.revertedWith("INVALID_PROOF");
    });
    it("invest with user 7 with less than min amount should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("100"), true, 2)).to.be.revertedWith("INSUFFICIENT_AMOUNT");
    });
    it("invest with user 7 with more than max amount should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("900"), true, 2)).to.be.revertedWith("TOO_MUCH_Q_WL");
    });

    it("invest with user 7 should compute right infos", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("200"), true, 2);
        const presaleInfo = await presaleContractWl.presaleInfos(1);
        expect(presaleInfo.vestingType).to.be.equal("2");
        expect(presaleInfo.cvgAmount).to.be.equal("909090909090909090909");
        expect(presaleInfo.stableInvested).to.be.equal("200000000000000000000");
    });
    it("check infos", async () => {
        const tokenIds = await presaleContractWl.getTokenIdsForWallet(user7.address);
        const tokenIdAndType = await presaleContractWl.getTokenIdAndType(user7.address, 0);
        const remainingCvgSupply = await presaleContractWl.getAmountCvgForVesting();
        expect(tokenIds[0]).to.be.equal("1");
        expect(tokenIdAndType[0]).to.be.equal("1");
        expect(tokenIdAndType[1]).to.be.equal("2");
        expect(remainingCvgSupply).to.be.equal("909090909090909090909");
    });
    it("re-invest with user 7 should revert", async () => {
        const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, user7.address);
        await expect(presaleContractWl.connect(user7).investMint(merkleProof7, ethers.parseEther("200"), true, 2)).to.be.revertedWith("ALREADY_MINTED");
    });

    it("refill with wrong owner should revert", async () => {
        await expect(presaleContractWl.connect(user8).refillToken(1, ethers.parseEther("100"), true)).to.be.revertedWith("NOT_OWNED");
    });

    it("refill with more than the max amount should revert", async () => {
        await expect(presaleContractWl.connect(user7).refillToken(1, ethers.parseEther("700"), true)).to.be.revertedWith("TOO_MUCH_Q_WL");
    });

    it("refill with max allocation remaining should compute right infos", async () => {
        await presaleContractWl.connect(user7).refillToken(1, ethers.parseEther("570"), true);
        const presaleInfo = await presaleContractWl.presaleInfos(1);
        expect(presaleInfo.vestingType).to.be.equal("2");
        expect(presaleInfo.cvgAmount).to.be.equal("3499999999999999999999");
        expect(presaleInfo.stableInvested).to.be.equal("770000000000000000000");
    });
    it("refill one more time should revert", async () => {
        await expect(presaleContractWl.connect(user7).refillToken(1, ethers.parseEther("100"), true)).to.be.revertedWith("TOO_MUCH_Q_WL");
    });
    it("withdraw all dai balance", async () => {
        expect(await dai.balanceOf(presaleContractWl)).to.be.equal("770000000000000000000");
        await presaleContractWl.connect(treasuryDao).withdrawToken(dai);
        expect(await dai.balanceOf(presaleContractWl)).to.be.equal("0");
        expect(await dai.balanceOf(treasuryDao)).to.be.equal("770000000000000000000");
    });
    it("set merkle root should compute right infos", async () => {
        await presaleContractWl.connect(treasuryDao).setMerkleRootWl("0x0000000000000000000000000000000000000000000000000000000000000000", 1);
    });
    it("set baseURI should compute right infos", async () => {
        await presaleContractWl.connect(treasuryDao).setBaseURI("");
        expect(await presaleContractWl.tokenURI(1)).to.be.equal("");
    });
});
