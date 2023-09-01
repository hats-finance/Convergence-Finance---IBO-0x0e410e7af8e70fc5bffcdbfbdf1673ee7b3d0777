const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestHelper = require("../../TestHelper");
chai.use(chaiAsPromised).should();
const expect = chai.expect;
const {TOKENS, REAL_IBO_PARAMETERS} = require("../../../scripts/config");
const {MAX_INTEGER} = require("@nomicfoundation/ethereumjs-util");
const {loadFixture, time} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {deployIboFixture} = require("../../fixtures/fixtures");

const PEPE_PRIVILEGE_TYPE = 0;
const CLASSIC_PRIVILEGE_TYPE = 1;

const FRAX_BOND_ID = 1;
const CRV_BOND_ID = 2;
const CVX_BOND_ID = 3;

describe("Ibo - Initial Bond Offering", () => {
    let iboContract, convergencePriceOracleContract;
    let user10, user1, treasuryDao, treasuryBonds;
    let crv, cvx, frax;
    let CVG_PRICE_NO_ROI;

    let merkleProof1, merkleProof2;

    let cvgMinted1 = 0n;

    let cvgSold2 = 0n;

    before(async () => {
        const {contracts, users} = await loadFixture(deployIboFixture);

        iboContract = contracts.iboContract;
        convergencePriceOracleContract = contracts.convergencePriceOracleContract;

        crv = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.CRV.address);
        cvx = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.CVX.address);
        frax = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.FRAX.address);

        user10 = users.user10;
        user1 = users.user1;
        user2 = users.user2;
        treasuryDao = users.treasuryDao;
        treasuryBonds = users.treasuryBonds;

        // ------------- APPROVAL ---------------- //

        // approve users CRV spending from iboContract
        await crv.connect(user10).approve(iboContract, MAX_INTEGER);
        await crv.connect(user1).approve(iboContract, MAX_INTEGER);
        await crv.connect(user2).approve(iboContract, MAX_INTEGER);

        // approve users CVX spending from iboContract
        await cvx.connect(user10).approve(iboContract, MAX_INTEGER);
        await cvx.connect(user2).approve(iboContract, MAX_INTEGER);

        await cvx.connect(user1).approve(iboContract, MAX_INTEGER);

        // approve users FRAX spending from iboContract
        await frax.connect(user10).approve(iboContract, MAX_INTEGER);
        await frax.connect(user1).approve(iboContract, MAX_INTEGER);

        CVG_PRICE_NO_ROI = await iboContract.CVG_PRICE_NO_ROI();

        merkleProof1 = TestHelper.getProofMerkle(contracts.pepeWl, users.user1.address);
        merkleProof2 = TestHelper.getProofMerkle(contracts.classicWl, users.user2.address);
    });

    it("Fails : createBond with not treasuryDao", async () => {
        await iboContract.createBond(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS).should.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Success : Create FRAX bond", async () => {
        await iboContract.connect(treasuryBonds).createBond(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS);
        const bondParamsFrax = await iboContract.bondsParams(1);

        expect(bondParamsFrax.composedFunction).to.be.eq(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS.composedFunction);
        expect(bondParamsFrax.token).to.be.eq(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS.token);
        expect(bondParamsFrax.minRoi).to.be.eq(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS.minRoi);
        expect(bondParamsFrax.maxRoi).to.be.eq(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS.maxRoi);
        expect(bondParamsFrax.percentageMaxCvgToMint).to.be.eq(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS.percentageMaxCvgToMint);
        expect(bondParamsFrax.maxCvgToMint).to.be.eq(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS.maxCvgToMint);
    });

    it("Success : Create CRV bond", async () => {
        await iboContract.connect(treasuryBonds).createBond(REAL_IBO_PARAMETERS.CRV.BOND_PARAMETERS);
    });

    it("Success : Create CVX bond", async () => {
        await iboContract.connect(treasuryBonds).createBond(REAL_IBO_PARAMETERS.CVX.BOND_PARAMETERS);
    });

    it("Fails : Bond, but not in pepe merkle tree", async () => {
        await iboContract
            .connect(user1)
            .deposit(0, FRAX_BOND_ID, ethers.parseEther("100"), ethers.parseEther("100"), CLASSIC_PRIVILEGE_TYPE, merkleProof1)
            .should.be.revertedWith("INVALID_PROOF");
    });

    it("Fails : Bond, but not in classic merkle tree", async () => {
        await iboContract
            .connect(user2)
            .deposit(0, FRAX_BOND_ID, ethers.parseEther("100"), ethers.parseEther("100"), PEPE_PRIVILEGE_TYPE, merkleProof2)
            .should.be.revertedWith("INVALID_PROOF");
    });

    it("Fails : Success to mint a bond in the PEPE merkle tree", async () => {
        const amountTooMuchForPepe = ethers.parseEther("7000");

        await iboContract
            .connect(user1)
            .deposit(0, FRAX_BOND_ID, amountTooMuchForPepe, amountTooMuchForPepe, PEPE_PRIVILEGE_TYPE, merkleProof1)
            .should.be.revertedWith("MAX_CVG_PEPE_PRIVILEGE");
    });

    it("Fails :  to mint a bond in the classic merkletree", async () => {
        const amountTooMuchForPepe = ethers.parseEther("15000");

        await iboContract
            .connect(user2)
            .deposit(0, CRV_BOND_ID, amountTooMuchForPepe, amountTooMuchForPepe, CLASSIC_PRIVILEGE_TYPE, merkleProof2)
            .should.be.revertedWith("MAX_CVG_WL_PRIVILEGE");
    });

    it("Success : to mint a bond in through PEPE merkle tree", async () => {
        const amountDeposited = ethers.parseEther("2500");
        await expect(
            iboContract.connect(user1).deposit(0, FRAX_BOND_ID, amountDeposited, amountDeposited, PEPE_PRIVILEGE_TYPE, merkleProof1)
        ).to.changeTokenBalances(frax, [user1, treasuryBonds], [-amountDeposited, amountDeposited]);

        cvgMinted1 += 9469696969696969696969n;
        expect(await iboContract.soldDuringPrivilege(user1)).to.be.eq(9469696969696969696969n); // 9,615 cvg
        expect(await iboContract.totalCvgDuePerBond(1)).to.be.eq(9469696969696969696969n); // 9,615 cvg
        expect(await iboContract.totalCvgPerToken(1)).to.be.eq(9469696969696969696969n); // 9,615 cvg
    });

    it("Success : to mint a bond in the classic merkletree", async () => {
        const amountDeposited = ethers.parseEther("1000");

        await expect(
            iboContract.connect(user2).deposit(0, CRV_BOND_ID, amountDeposited, amountDeposited, CLASSIC_PRIVILEGE_TYPE, merkleProof2)
        ).to.changeTokenBalances(crv, [user2, treasuryBonds], [-amountDeposited, amountDeposited]);
    });

    it("Fail : Bond some FRAX", async () => {
        await iboContract.connect(user1).deposit(0, FRAX_BOND_ID, 0, ethers.parseEther("100"), PEPE_PRIVILEGE_TYPE, merkleProof1).should.be.revertedWith("LTE");
    });

    it("Success : Jump in time, after the Peprivilege", async () => {
        await time.increase(60 * 69);
    });

    it("Fail : Bond on frax, the maximum per bond tx is reached", async () => {
        await iboContract
            .connect(user1)
            .deposit(0, FRAX_BOND_ID, ethers.parseEther("5500"), ethers.parseEther("19000"), PEPE_PRIVILEGE_TYPE, merkleProof1)
            .should.be.revertedWith("MAX_CVG_PER_BOND");
    });

    it("Fail : Bond on frax, the minimum output is not reached", async () => {
        await iboContract
            .connect(user1)
            .deposit(0, FRAX_BOND_ID, ethers.parseEther("100"), ethers.parseEther("500"), PEPE_PRIVILEGE_TYPE, merkleProof1)
            .should.be.revertedWith("OUT_MIN_NOT_REACHED");
    });

    it("Success : Bond some FRAX with User 1", async () => {
        const fraxBalanceBefore = await frax.balanceOf(user1.address);

        const fraxRoi = (await iboContract.getBondView(1)).bondRoi; // 10% ROI
        const bondPriceInUsd = (CVG_PRICE_NO_ROI * (1000000n - fraxRoi)) / 1000000n;
        const FRAX_AMOUNT_IN = ethers.parseEther("100"); // 100 FRAX

        await expect(
            iboContract.connect(user1).deposit(0, FRAX_BOND_ID, FRAX_AMOUNT_IN, ethers.parseEther("250"), PEPE_PRIVILEGE_TYPE, merkleProof1)
        ).to.changeTokenBalances(frax, [user1, treasuryBonds], [-FRAX_AMOUNT_IN, FRAX_AMOUNT_IN]);
        // Check the NFT minted to the user
        cvgSold2 = (FRAX_AMOUNT_IN * ethers.parseEther("1")) / bondPriceInUsd;
        expect(await iboContract.totalCvgPerToken(3)).to.be.eq(cvgSold2);
    });

    it("Fail : Bond on a token not owned", async () => {
        await iboContract
            .connect(user10)
            .deposit(1, FRAX_BOND_ID, ethers.parseEther("500"), ethers.parseEther("250"), PEPE_PRIVILEGE_TYPE, merkleProof1)
            .should.be.revertedWith("TOKEN_NOT_OWNED");
    });

    it("Success : Bond some FRAX on token 1", async () => {
        const userFraxBalanceBefore = await frax.balanceOf(user1.address);
        const treasuryBondsFraxBalanceBefore = await frax.balanceOf(treasuryBonds.address);
        const token1CvgValueBefore = await iboContract.totalCvgPerToken(1);

        const fraxRoi = (await iboContract.getBondView(1)).bondRoi; // 10% ROI
        const bondPriceInUsd = (CVG_PRICE_NO_ROI * (1000000n - fraxRoi)) / 1000000n;

        const FRAX_AMOUNT_IN = ethers.parseEther("200"); // 200 FRAX

        await iboContract.connect(user1).deposit(1, FRAX_BOND_ID, FRAX_AMOUNT_IN, ethers.parseEther("250"), PEPE_PRIVILEGE_TYPE, merkleProof1);

        const userFraxBalanceAfter = await frax.balanceOf(user1.address);
        const treasuryBondsFraxBalanceAfter = await frax.balanceOf(treasuryBonds.address);

        // Check that tokens are taken from user
        expect(userFraxBalanceBefore - userFraxBalanceAfter).to.be.eq(FRAX_AMOUNT_IN);
        // Check that tokens go to bond treasury
        expect(treasuryBondsFraxBalanceAfter - treasuryBondsFraxBalanceBefore).to.be.eq(FRAX_AMOUNT_IN);
        // Check the NFT minted to the user
        expect(await iboContract.totalCvgPerToken(1)).to.be.eq(token1CvgValueBefore + (FRAX_AMOUNT_IN * ethers.parseEther("1")) / bondPriceInUsd);
    });

    it("Success : Add FRAX on token 1 ", async () => {
        const FRAX_AMOUNT_IN = ethers.parseEther("200"); // 200 FRAX
        const token1CvgValueBefore = await iboContract.totalCvgPerToken(1);

        const fraxRoi = (await iboContract.getBondView(1)).bondRoi; // 10% ROI
        const bondPriceInUsd = (CVG_PRICE_NO_ROI * (1000000n - fraxRoi)) / 1000000n;

        await expect(
            iboContract.connect(user1).deposit(1, FRAX_BOND_ID, FRAX_AMOUNT_IN, ethers.parseEther("250"), PEPE_PRIVILEGE_TYPE, merkleProof1)
        ).to.changeTokenBalances(frax, [user1, treasuryBonds], [-FRAX_AMOUNT_IN, FRAX_AMOUNT_IN]);

        // Check that tokens go to bond treasury
        // Check the NFT minted to the user
        expect(await iboContract.totalCvgPerToken(1)).to.be.approximately(
            token1CvgValueBefore + (FRAX_AMOUNT_IN * ethers.parseEther("1")) / bondPriceInUsd,
            ethers.parseEther("1")
        );
    });

    it("Success : Bond some CRV with User 10", async () => {
        const crvRoi = (await iboContract.getBondView(2)).bondRoi; // 10% ROI
        const bondPriceInUsd = (CVG_PRICE_NO_ROI * (1000000n - crvRoi)) / 1000000n;
        const CRV_AMOUNT_IN = ethers.parseEther("100");
        const crvPrice = (await convergencePriceOracleContract.getPriceOracle(crv))[0];

        await expect(
            iboContract.connect(user10).deposit(0, CRV_BOND_ID, CRV_AMOUNT_IN, ethers.parseEther("100"), PEPE_PRIVILEGE_TYPE, merkleProof1)
        ).to.changeTokenBalances(crv, [user10.address, treasuryBonds.address], [-CRV_AMOUNT_IN, CRV_AMOUNT_IN]);

        // Check the NFT minted to the user
        expect(await iboContract.totalCvgPerToken(4)).to.be.eq((CRV_AMOUNT_IN * crvPrice) / bondPriceInUsd);
    });

    it("Success : Bond some CVX with User 10 on the same token as CRV", async () => {
        const token4CvgValueBefore = await iboContract.totalCvgPerToken(4);

        const cvxRoi = (await iboContract.getBondView(3)).bondRoi; // 10% ROI
        const bondPriceInUsd = (CVG_PRICE_NO_ROI * (1000000n - cvxRoi)) / 1000000n;

        const CVX_AMOUNT_IN = ethers.parseEther("0.1"); //0.1CVX
        const cvxPrice = (await convergencePriceOracleContract.getPriceOracle(cvx))[0];

        await expect(
            iboContract.connect(user10).deposit(4, CVX_BOND_ID, CVX_AMOUNT_IN, ethers.parseEther("0.1"), PEPE_PRIVILEGE_TYPE, merkleProof1)
        ).to.changeTokenBalances(cvx, [user10.address, treasuryBonds.address], [-CVX_AMOUNT_IN, CVX_AMOUNT_IN]);

        // Check the NFT minted to the user
        expect(await iboContract.totalCvgPerToken(4)).to.be.eq(token4CvgValueBefore + (CVX_AMOUNT_IN * cvxPrice) / bondPriceInUsd);
    });
});
