const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const TestHelper = require("../../TestHelper");
const {expect} = require("chai");
const {deployBondCalculatorFixture} = require("../../fixtures/fixtures");

describe("BondCalculator / computeCvgExpected", function () {
    let helper;
    let bondCalculatorContract;
    let cvgExpected;
    const BOND_DURATION = 86_400 * 5;

    before(async () => {
        helper = new TestHelper();
        const {contracts, users} = await loadFixture(deployBondCalculatorFixture);
        bondCalculatorContract = contracts.bondCalculatorContract;
    });

    function computeTokenExpectedSqrt(durationFromStart, maxAmount) {
        return Math.sqrt(durationFromStart / BOND_DURATION) * maxAmount;
    }

    function computeTokenExpectedPow2(durationFromStart, maxAmount) {
        return Math.pow(durationFromStart / BOND_DURATION, 2) * maxAmount;
    }

    function computeTokenExpectedLn(durationFromStart, maxAmount) {
        return (Math.log(durationFromStart / BOND_DURATION) / Math.log(maxAmount) + 1) * maxAmount;
    }

    it("should compute CVG expected with sqrt and a 1M target", async () => {
        for (let i = 43200; i < BOND_DURATION; ) {
            cvgExpected = await bondCalculatorContract.computeCvgExpectedUInt(i, BOND_DURATION, 0, ethers.parseEther("1000000"));
            expect(Number(ethers.formatEther(cvgExpected))).to.be.approximately(computeTokenExpectedSqrt(i, 1_000_000), 1);
            i += 43200;
        }
    });

    it("should compute CVG expected with ln and a 1M target", async () => {
        for (let i = 43200; i < BOND_DURATION; ) {
            cvgExpected = await bondCalculatorContract.computeCvgExpectedUInt(i, BOND_DURATION, 1, ethers.parseEther("1000000"));
            expect(Number(ethers.formatEther(cvgExpected))).to.be.approximately(computeTokenExpectedLn(i, 1_000_000), 1);
            i += 43200;
        }
    });

    it("should compute CVG expected with ln and a 50k target", async () => {
        for (let i = 43200; i < BOND_DURATION; ) {
            cvgExpected = await bondCalculatorContract.computeCvgExpectedUInt(i, BOND_DURATION, 1, ethers.parseEther("50000"));
            expect(Number(ethers.formatEther(cvgExpected))).to.be.approximately(computeTokenExpectedLn(i, 50_000), 1);
            i += 43200;
        }
    });

    it("should compute CVG expected with ² and a 1M target", async () => {
        for (let i = 43200; i < BOND_DURATION; ) {
            cvgExpected = await bondCalculatorContract.computeCvgExpectedUInt(i, BOND_DURATION, 2, ethers.parseEther("1000000"));
            expect(Number(ethers.formatEther(cvgExpected))).to.be.approximately(computeTokenExpectedPow2(i, 1_000_000), 1);
            i += 43200;
        }
    });
});
