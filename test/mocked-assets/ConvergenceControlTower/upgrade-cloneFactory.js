const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestHelper = require("../../TestHelper");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployOracleFixture} = require("../../fixtures/fixtures");

chai.use(chaiAsPromised).should();
const expect = chai.expect;

const helper = new TestHelper();

describe("CloneFactory Proxy", () => {
    let treasuryDao;
    let controlTowerContract;
    let cloneFactoryContract;
    let baseTestContract;
    let testContract;
    let proxyAdmin;
    before(async () => {
        const {contracts, users} = await loadFixture(deployOracleFixture);

        baseTestContract = await ethers.deployContract("BaseTest", []);
        await baseTestContract.waitForDeployment();
        treasuryDao = users.treasuryDao;
        proxyAdmin = contracts.proxyAdmin;
        controlTowerContract = contracts.controlTowerContract;
        cloneFactoryContract = contracts.cloneFactoryContract;
    });

    it("Initialize base contract should be reverted", async () => {
        await baseTestContract.initialize(controlTowerContract).should.be.revertedWith("Initializable: contract is already initialized");
    });

    it("Upgrade with a V2 implementation", async () => {
        //implementation
        const CloneFactoryImplementation = await ethers.getContractFactory("CloneFactory");
        const CloneFactoryV2Implementation = await ethers.getContractFactory("mock_CloneFactoryV2");
        await upgrades.validateUpgrade(CloneFactoryImplementation, CloneFactoryV2Implementation);

        const cloneFactoryV2Implementation = await hre.ethers.deployContract("mock_CloneFactoryV2", []);
        await cloneFactoryV2Implementation.waitForDeployment();

        //upgrade proxy
        await proxyAdmin.connect(treasuryDao).upgrade(cloneFactoryContract, cloneFactoryV2Implementation);
        cloneFactoryContract = await ethers.getContractAt("mock_CloneFactoryV2", await cloneFactoryContract.getAddress());

        (await cloneFactoryContract.cvgControlTower()).should.be.equal(await controlTowerContract.getAddress());
        (await cloneFactoryContract.owner()).should.be.equal(treasuryDao.address);
    });

    it("Test new function create test contract", async () => {
        const tx = await cloneFactoryContract.connect(treasuryDao).createBaseTest(baseTestContract);
        await expect(tx).to.emit(cloneFactoryContract, "TestCreated");

        const receipt = await tx.wait();
        const event = receipt.logs.find((e) => e?.fragment?.name === "TestCreated");
        testContract = await ethers.getContractAt("BaseTest", event.args.clone);

        const counter = await testContract.counter();
        expect(counter).to.be.equal(0);
    });

    it("Increment counter on test contract", async () => {
        await testContract.connect(treasuryDao).incrementCounter();
        const counter = await testContract.counter();
        expect(counter).to.be.equal(1);
    });
});
