const {AGGREGATOR_CONFIGS} = require("../../config");
const GlobalHelper = require("../../../utils/GlobalHelper");
const ApiHelper = require("../../../test/ApiHelper");

const deployAggregatorsClones = async (contracts, users) => {
    let prices;

    const tokenNames = ["tokemak", "conic-finance", "stake-dao", "ethereum"];
    prices = await ApiHelper.getCoinGeckoTokenPrices(tokenNames, "usd", false);

    const receiptCvg = await (
        await contracts.cloneFactoryContract
            .connect(users.treasuryDao)
            .createCvgAggregator(AGGREGATOR_CONFIGS.CVG.decimals, AGGREGATOR_CONFIGS.CVG.description, 1)
    ).wait();
    const eventCvg = receiptCvg.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const cvgAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventCvg.args.clone);
    await (await cvgAggregatorV3.connect(users.treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(0.39, 18))).wait();

    const receiptToke = await (
        await contracts.cloneFactoryContract
            .connect(users.treasuryDao)
            .createCvgAggregator(AGGREGATOR_CONFIGS.TOKE.decimals, AGGREGATOR_CONFIGS.TOKE.description, 1)
    ).wait();
    const eventToke = receiptToke.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const tokeAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventToke.args.clone);
    await (await tokeAggregatorV3.connect(users.treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["tokemak"].usd, 18))).wait();

    const receiptEth = await (await contracts.cloneFactoryContract.connect(users.treasuryDao).createCvgAggregator(18, "ETH aggreg", 1)).wait();
    const eventEth = receiptEth.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const ethAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventEth.args.clone);
    await (await ethAggregatorV3.connect(users.treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["ethereum"].usd, 18))).wait();

    const receiptCnc = await (
        await contracts.cloneFactoryContract
            .connect(users.treasuryDao)
            .createCvgAggregator(AGGREGATOR_CONFIGS.CNC.decimals, AGGREGATOR_CONFIGS.CNC.description, 1)
    ).wait();
    const eventCnc = receiptCnc.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const cncAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventCnc.args.clone);
    await (await cncAggregatorV3.connect(users.treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["conic-finance"].usd, 18))).wait();

    const receiptStd = await (
        await contracts.cloneFactoryContract
            .connect(users.treasuryDao)
            .createCvgAggregator(AGGREGATOR_CONFIGS.STD.decimals, AGGREGATOR_CONFIGS.STD.description, 1)
    ).wait();
    const eventStd = receiptStd.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const stdAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventStd.args.clone);
    await (await stdAggregatorV3.connect(users.treasuryDao).setLatestPrice(GlobalHelper.priceToBigNumber(prices["stake-dao"].usd, 18))).wait();

    const receiptCreateUsdcAggregator = await (await contracts.cloneFactoryContract.connect(users.treasuryDao).createCvgAggregator(6, "USDC", 1)).wait();
    const eventUsdc = receiptCreateUsdcAggregator.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const usdcAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventUsdc.args.clone);
    await (await usdcAggregatorV3.connect(users.treasuryDao).setLatestPrice("1000000")).wait();

    const receiptCreateDaiAggregator = await (
        await contracts.cloneFactoryContract.connect(users.treasuryDao).createCvgAggregator(6, "Dai price feed", 1)
    ).wait();
    const eventDai = receiptCreateDaiAggregator.logs.find((e) => e.fragment.name === "AggregatorCreated");
    const daiAggregatorV3 = await ethers.getContractAt("CvgV3Aggregator", eventDai.args.clone);
    await (await daiAggregatorV3.connect(users.treasuryDao).setLatestPrice("1000000")).wait();

    return {...contracts, ...{cvgAggregatorV3, tokeAggregatorV3, cncAggregatorV3, stdAggregatorV3, usdcAggregatorV3, daiAggregatorV3, ethAggregatorV3}};
};
module.exports = deployAggregatorsClones;
