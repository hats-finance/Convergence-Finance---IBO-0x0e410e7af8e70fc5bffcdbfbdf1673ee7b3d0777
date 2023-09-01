const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const TestHelper = require("../../TestHelper");
const {expect} = require("chai");
const {deployBondCalculatorFixture} = require("../../fixtures/fixtures");

describe("Bond Calculator tests", function () {
    let helper;
    let bondCalculatorContract;

    const VESTING_TIME = 43200; // Half a day

    const INCR = 2000;

    before(async () => {
        helper = new TestHelper();
        const {contracts, users} = await loadFixture(deployBondCalculatorFixture);

        bondCalculatorContract = contracts.bondCalculatorContract;
    });
    it("Should compute NumberTokenReal/NumberTokenExpected ratio", async () => {
        let ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(1, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("200000"));
        expect(ntrNtcRatio).to.be.eq("41569219");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(1 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("200000"));
        expect(ntrNtcRatio).to.be.eq("929516");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(2 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("200000"));
        expect(ntrNtcRatio).to.be.eq("657267");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(3 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("200000"));

        expect(ntrNtcRatio).to.be.eq("536656");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(3 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("470000"));

        expect(ntrNtcRatio).to.be.eq("1261142");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(3 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("500000"));

        expect(ntrNtcRatio).to.be.eq("1341640");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(3 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("0"));

        expect(ntrNtcRatio).to.be.eq("0");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(3 * INCR, VESTING_TIME, 2, ethers.parseEther("1000000"), ethers.parseEther("200000"));
        expect(ntrNtcRatio).to.be.eq("10368000");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(56 * INCR, VESTING_TIME, 0, ethers.parseEther("1000000"), ethers.parseEther("200000"));
        expect(ntrNtcRatio).to.be.eq("124211");

        ntrNtcRatio = await bondCalculatorContract.computeNtrDivNtc(56 * INCR, VESTING_TIME, 2, ethers.parseEther("1000000"), ethers.parseEther("200000"));
        expect(ntrNtcRatio).to.be.eq("29755");
    });

    it("Should compute the bond ROI", async () => {
        let bondRoI = await bondCalculatorContract.computeRoi(1, VESTING_TIME, 0, ethers.parseEther("1000000"), 0, 250_000, 5_000, 5000, 65000);
        expect(bondRoI).to.be.eq("65000"); // 4.5% discount

        bondRoI = await bondCalculatorContract.computeRoi(
            1 * INCR,
            VESTING_TIME,
            0,
            ethers.parseEther("1000000"),
            ethers.parseEther("10000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("65000");

        bondRoI = await bondCalculatorContract.computeRoi(
            2 * INCR,
            VESTING_TIME,
            0,
            ethers.parseEther("1000000"),
            ethers.parseEther("200000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("55000");

        bondRoI = await bondCalculatorContract.computeRoi(
            2 * INCR, // +3*cycle
            VESTING_TIME,
            0,
            ethers.parseEther("1000000"),
            ethers.parseEther("0"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("65000");

        bondRoI = await bondCalculatorContract.computeRoi(
            VESTING_TIME - 100,
            VESTING_TIME,
            2,
            ethers.parseEther("1000000"),
            ethers.parseEther("200000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("65000");

        bondRoI = await bondCalculatorContract.computeRoi(
            3 * INCR, // +56*cycle
            VESTING_TIME,
            0,
            ethers.parseEther("1000000"),
            ethers.parseEther("200000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("55000");

        bondRoI = await bondCalculatorContract.computeRoi(
            5 * INCR, // +56*cycle
            VESTING_TIME,
            2,
            ethers.parseEther("1000000"),
            ethers.parseEther("200000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("5000");

        bondRoI = await bondCalculatorContract.computeRoi(
            6 * INCR,
            VESTING_TIME,
            0,
            ethers.parseEther("1000000"),
            ethers.parseEther("200000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("60000");

        bondRoI = await bondCalculatorContract.computeRoi(
            VESTING_TIME - 1,
            VESTING_TIME,
            2,
            ethers.parseEther("1000000"),
            ethers.parseEther("900000"),
            250_000,
            5_000,
            5000,
            65000
        );
        expect(bondRoI).to.be.eq("50000");
    });
});
