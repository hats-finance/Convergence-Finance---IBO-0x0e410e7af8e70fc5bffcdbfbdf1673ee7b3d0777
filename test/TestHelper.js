const {ethers, upgrades} = require("hardhat");
const GlobalHelper = require("../utils/GlobalHelper");

const linkPreseed = require("../scripts/linkers/preseed");

const deployers = require("../scripts/deployer/unit/index");
const {TOKENS} = require("../scripts/config");
const FakeLiquiditydeployer = require("../scripts/FakeLiquidityDeployer");
const linkCvgPepe = require("../scripts/linkers/cvgPepe");
const fakeLiquiditydeployer = new FakeLiquiditydeployer();

class TestHelper extends GlobalHelper {
    users = {};
    contracts = {};

    static erc20ArtifactName = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        GLOBAL CONTEXTES
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    deployBase = async (isPresale = false) => {
        await this._configureAccounts();

        this.contracts = await deployers.deployProxyAdmin(this.contracts, this.users);
        this.contracts = await deployers.deployControlTowerContract(this.contracts, this.users);
        this.contracts = await deployers.deployCloneFactoryContract(this.contracts, this.users);
        this.contracts = await deployers.deployFakeAsset(this.contracts, this.users, TOKENS, ethers.parseEther("5000000"));

        let receiver = this.users.owner.address;
        if (isPresale) {
            this.contracts = await linkPreseed(this.contracts);
            this.contracts = await deployers.deployPresaleWl(this.contracts, this.users);
            this.contracts = await deployers.deployBondCalculatorContract(this.contracts, this.users, true);
            this.contracts = await deployers.deployOracleContract(this.contracts, this.users, true);
            this.contracts = await deployers.deployIboContract(this.contracts, this.users);
            this.contracts = await deployers.deployVestingCvg(this.contracts);

            receiver = this.contracts.vestingContract;
        }
        this.contracts = await deployers.deployCvgTokenContract(this.contracts, this.users, receiver);

        if (isPresale) {
            //set CVG in vesting
            await this.contracts.vestingContract.connect(this.users.treasuryDao).setCvg(this.contracts.cvgContract);
        }

        return this.contracts;
    };

    deployCvgPepe = async () => {
        await this._configureAccounts();
        this.contracts = await deployers.deployCvgPepe(this.contracts, this.users);
    };

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        PRESALE/VESTING CONTEXTES
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    deployPresaleVesting = async () => {
        this.contracts = await this.deployBase(true);
        return {contracts: this.contracts, users: this.users};
    };

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        BOND CONTEXTES
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    deployBondCalculator = async () => {
        this.contracts = await this.deployBase(false);
        this.contracts = await deployers.deployBondCalculatorContract(this.contracts, this.users);
        return {contracts: this.contracts, users: this.users};
    };

    deployOracle = async () => {
        this.contracts = await this.deployBase(false);
        this.contracts = await fakeLiquiditydeployer.deployCvgLiquidity(this.contracts);
        this.contracts = await deployers.deployBaseAggregatorContract(this.contracts, this.users);
        this.contracts = await deployers.deployAggregatorClones(this.contracts, this.users);
        this.contracts = await deployers.deployOracleContract(this.contracts, this.users);
        return {contracts: this.contracts, users: this.users};
    };

    deployIbo = async () => {
        await this._configureAccounts();
        this.contracts = await this.deployBase(false);
        this.contracts = await deployers.deployOracleContract(this.contracts, this.users, true);

        this.contracts = await deployers.deployBondCalculatorContract(this.contracts, this.users, true);

        this.contracts = await deployers.deployIboContract(this.contracts, this.users);

        return {contracts: this.contracts, users: this.users};
    };
    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                       HELPERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    async upgradeContracts(cloneFactory = false) {
        const ControlTowerFactoryV2 = await ethers.getContractFactory("CvgControlTowerV2");
        this.contracts.controlTowerContract = await upgrades.upgradeProxy(this.contracts.controlTowerContract, ControlTowerFactoryV2);

        if (cloneFactory) {
            const CloneFactoryV2 = await ethers.getContractFactory("CloneFactoryV2");
            this.contracts.cloneFactoryContract = await upgrades.upgradeProxy(this.contracts.cloneFactoryContract, CloneFactoryV2);
        }
    }
}

module.exports = TestHelper;
