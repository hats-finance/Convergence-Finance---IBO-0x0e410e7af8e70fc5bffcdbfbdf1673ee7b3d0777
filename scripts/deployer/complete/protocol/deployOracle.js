const {AGGREGATOR_CONFIGS} = require("../../../config");
const GlobalHelper = require("../../../../utils/GlobalHelper");
const ApiHelper = require("../../../../test/ApiHelper");
const h = require("../helper");

const deployOracle = async () => {
    const users = await ethers.getSigners();
    const owner = users[0];
    const treasuryDao = users[13];
    const treasuryStaking = users[14];
    const treasuryBonds = users[15];

    // Contracts
    const CONTROL_TOWER_CONTRACT = "CvgControlTower";
    const ORACLE_CONTRACT = "CvgOracle";
    const CLONE_FACTORY_CONTRACT = "CloneFactory";

    // Deploy Oracle Contract
    const DEPLOY_ORACLE_CONTRACT = "DEPLOY_ORACLE_CONTRACT";
    if (!h.getTrigger(DEPLOY_ORACLE_CONTRACT)) {
        const convergencePriceOracleContract = await hre.ethers.deployContract(ORACLE_CONTRACT, [treasuryDao]);
        await convergencePriceOracleContract.waitForDeployment();

        h.writeFile(ORACLE_CONTRACT, await convergencePriceOracleContract.getAddress(), DEPLOY_ORACLE_CONTRACT);
        console.log("oracle deployed");
    }

    // Set the Oracle address in the ControlTower
    const SET_ORACLE_IN_CONTROL_TOWER = "SET_ORACLE_IN_CONTROL_TOWER";
    if (!h.getTrigger(SET_ORACLE_IN_CONTROL_TOWER)) {
        const controlTowerContract = await h.getContract(CONTROL_TOWER_CONTRACT);
        await (await controlTowerContract.connect(treasuryDao).setOracle(h.getAddress(ORACLE_CONTRACT))).wait();
        h.writeFile(null, null, SET_ORACLE_IN_CONTROL_TOWER);
        console.log("oracle setted");
    }

    // Deploy Clones Aggregator Contracts
    const DEPLOY_CLONES_AGGREGATOR_CONTRACTS = "DEPLOY_CLONES_AGGREGATOR_CONTRACTS";
    if (!h.getTrigger(DEPLOY_CLONES_AGGREGATOR_CONTRACTS)) {
        const cloneFactoryContract = await h.getContract(CLONE_FACTORY_CONTRACT);
        let prices;
        const tokenNames = ["tokemak", "conic-finance", "stake-dao"];
        prices = await ApiHelper.getCoinGeckoTokenPrices(tokenNames, "usd", false);

        let aggregatorContracts = {};

        ///////CVG///////
        const receiptCvg = await (
            await cloneFactoryContract.connect(treasuryDao).createCvgAggregator(AGGREGATOR_CONFIGS.CVG.decimals, AGGREGATOR_CONFIGS.CVG.description, 1)
        ).wait();
        const eventCvg = receiptCvg.logs.find((e) => e?.fragment?.name === "AggregatorCreated");
        const cvgAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventCvg.args.clone);
        await (await cvgAggregatorV3.connect(treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(0.33, 18))).wait();
        aggregatorContracts["cvgAggregatorV3"] = await cvgAggregatorV3.getAddress();

        ///////TOKE///////
        const receiptToke = await (
            await cloneFactoryContract.connect(treasuryDao).createCvgAggregator(AGGREGATOR_CONFIGS.TOKE.decimals, AGGREGATOR_CONFIGS.TOKE.description, 1)
        ).wait();
        const eventToke = receiptToke.logs.find((e) => e?.fragment?.name === "AggregatorCreated");
        const tokeAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventToke.args.clone);
        await (await tokeAggregatorV3.connect(treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["tokemak"].usd, 18))).wait();
        aggregatorContracts["tokeAggregatorV3"] = await tokeAggregatorV3.getAddress();

        ///////CNC///////
        const receiptCnc = await (
            await cloneFactoryContract.connect(treasuryDao).createCvgAggregator(AGGREGATOR_CONFIGS.CNC.decimals, AGGREGATOR_CONFIGS.CNC.description, 1)
        ).wait();
        const eventCnc = receiptCnc.logs.find((e) => e?.fragment?.name === "AggregatorCreated");
        const cncAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventCnc.args.clone);
        await (await cncAggregatorV3.connect(treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["conic-finance"].usd, 18))).wait();
        aggregatorContracts["cncAggregatorV3"] = await cncAggregatorV3.getAddress();

        ///////STD///////
        const receiptStd = await (
            await cloneFactoryContract.connect(treasuryDao).createCvgAggregator(AGGREGATOR_CONFIGS.STD.decimals, AGGREGATOR_CONFIGS.STD.description, 1)
        ).wait();
        const eventStd = receiptStd.logs.find((e) => e?.fragment?.name === "AggregatorCreated");
        const stdAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventStd.args.clone);
        await (await stdAggregatorV3.connect(treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["stake-dao"].usd, 18))).wait();
        aggregatorContracts["stdAggregatorV3"] = await stdAggregatorV3.getAddress();

        /////
        h.writeFile("aggregatorContracts", aggregatorContracts, DEPLOY_CLONES_AGGREGATOR_CONTRACTS);
        console.log("clones aggregator deployed");
    }

    // Set the Cvg Pool address in Oracle contract
    const SET_CVG_TOKEN_IN_ORACLE = "SET_CVG_TOKEN_IN_ORACLE";
    if (!h.getTrigger(SET_CVG_TOKEN_IN_ORACLE)) {
        const aggregators = h.getAddress("aggregatorContracts");
        const cvgAggregator = aggregators.cvgAggregatorV3;
        const convergencePriceOracleContract = await h.getContract(ORACLE_CONTRACT);

        await (await convergencePriceOracleContract.connect(treasuryDao).setCvgToken(h.getAddress("Cvg"))).wait();

        h.writeFile(null, null, SET_CVG_TOKEN_IN_ORACLE);
        console.log("Cvg Token setted in oracle");
    }

    // Set the Cvg Pool address in Oracle contract
    const SET_CVG_POOL_IN_ORACLE = "SET_CVG_POOL_IN_ORACLE";
    if (!h.getTrigger(SET_CVG_POOL_IN_ORACLE)) {
        const aggregators = h.getAddress("aggregatorContracts");
        const cvgAggregator = aggregators.cvgAggregatorV3;
        const convergencePriceOracleContract = await h.getContract(ORACLE_CONTRACT);
        await (
            await convergencePriceOracleContract.connect(treasuryDao).setTokenOracleParams(h.getAddress("Cvg"), {
                isStable: false,
                poolType: 2,
                poolAddress: h.getAddress("CVG_POOl"),
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: cvgAggregator,
                deltaAggregatorCvgOracle: 1000, // 10% delta error allowed
                twapInterval: 0,
                maxLastUpdateAggregator: 120000,
            })
        ).wait();

        h.writeFile(null, null, SET_CVG_POOL_IN_ORACLE);
        console.log("Cvg Pool setted in oracle");
    }

    // Set the Cvg Pool address in Oracle contract
    const SET_TOKENS_POOL_IN_ORACLE = "SET_TOKENS_POOL_IN_ORACLE";
    if (!h.getTrigger(SET_TOKENS_POOL_IN_ORACLE)) {
        const aggregators = h.getAddress("aggregatorContracts");
        const cvgAggregator = aggregators.cvgAggregatorV3;
        const convergencePriceOracleContract = await h.getContract(ORACLE_CONTRACT);

        await (
            await convergencePriceOracleContract.connect(treasuryDao).setTokenOracleParams(h.getAddress("Cvg"), {
                isStable: false,
                poolType: 2,
                poolAddress: h.getAddress("CVG_POOl"),
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: cvgAggregator,
                deltaAggregatorCvgOracle: 1000, // 10% delta error allowed
                twapInterval: 0,
                maxLastUpdateAggregator: 120000,
            })
        ).wait();

        h.writeFile(null, null, SET_TOKENS_POOL_IN_ORACLE);
        console.log("Cvg Pool setted in oracle");
    }
};

module.exports = deployOracle;
