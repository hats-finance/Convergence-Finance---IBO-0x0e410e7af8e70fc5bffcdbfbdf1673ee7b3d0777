const {expect} = require("chai");

const {AGGREGATOR_CONFIGS} = require("../../../../scripts/config");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployOracleFixture} = require("../../../fixtures/fixtures");

describe("Cvg Aggregator tests", function () {
    let controlTowerContract;
    let baseAggregatorContract;
    let cvgAggregatorV3Contract, tokeAggregatorV3Contract, cncAggregatorV3Contract, stdAggregatorV3Contract, usdcAggregatorV3Contract, daiAggregatorV3Contract;
    let owner, treasuryDao, user1, user2, user3;

    before(async () => {
        const {contracts, users} = await loadFixture(deployOracleFixture);

        controlTowerContract = contracts.controlTowerContract;

        baseAggregatorContract = contracts.baseAggregatorContract;

        cvgAggregatorV3Contract = contracts.cvgAggregatorV3;
        tokeAggregatorV3Contract = contracts.tokeAggregatorV3;
        cncAggregatorV3Contract = contracts.cncAggregatorV3;
        stdAggregatorV3Contract = contracts.stdAggregatorV3;
        ethAggregatorV3Contract = contracts.ethAggregatorV3;
        usdcAggregatorV3Contract = contracts.usdcAggregatorV3;
        daiAggregatorV3Contract = contracts.daiAggregatorV3;

        owner = users.owner;
        treasuryDao = users.treasuryDao;
        user1 = users.user1;
        user2 = users.user2;
        user3 = users.user3;
    });

    it("Should have deployed aggregators", async () => {
        expect(await cvgAggregatorV3Contract.getAddress()).is.not.empty;
        expect(await tokeAggregatorV3Contract.getAddress()).is.not.empty;
        expect(await cncAggregatorV3Contract.getAddress()).is.not.empty;
        expect(await stdAggregatorV3Contract.getAddress()).is.not.empty;
    });

    it("Should have initialized aggregators", async () => {
        expect(await cvgAggregatorV3Contract.decimals()).to.be.eq(AGGREGATOR_CONFIGS.CVG.decimals);
        expect(await tokeAggregatorV3Contract.decimals()).to.be.eq(AGGREGATOR_CONFIGS.TOKE.decimals);
        expect(await cncAggregatorV3Contract.decimals()).to.be.eq(AGGREGATOR_CONFIGS.CNC.decimals);
        expect(await stdAggregatorV3Contract.decimals()).to.be.eq(AGGREGATOR_CONFIGS.STD.decimals);

        expect(await cvgAggregatorV3Contract.description()).to.be.eq(AGGREGATOR_CONFIGS.CVG.description);
        expect(await tokeAggregatorV3Contract.description()).to.be.eq(AGGREGATOR_CONFIGS.TOKE.description);
        expect(await cncAggregatorV3Contract.description()).to.be.eq(AGGREGATOR_CONFIGS.CNC.description);
        expect(await stdAggregatorV3Contract.description()).to.be.eq(AGGREGATOR_CONFIGS.STD.description);

        expect(await cvgAggregatorV3Contract.owner()).to.be.eq(treasuryDao.address);
        expect(await tokeAggregatorV3Contract.owner()).to.be.eq(treasuryDao.address);
        expect(await cncAggregatorV3Contract.owner()).to.be.eq(treasuryDao.address);
        expect(await stdAggregatorV3Contract.owner()).to.be.eq(treasuryDao.address);
    });

    it("Should index aggregator clones in CVG Control Tower", async () => {
        const aggregatorClonesNumber = await controlTowerContract.getAggregatorCloneLength(baseAggregatorContract);
        expect(aggregatorClonesNumber).to.be.eq(7);

        const aggregatorContracts = await controlTowerContract.getAggregatorContracts(baseAggregatorContract, 0, 20);

        expect(aggregatorContracts).to.be.eql([
            await cvgAggregatorV3Contract.getAddress(),
            await tokeAggregatorV3Contract.getAddress(),
            await ethAggregatorV3Contract.getAddress(),
            await cncAggregatorV3Contract.getAddress(),
            await stdAggregatorV3Contract.getAddress(),
            await usdcAggregatorV3Contract.getAddress(),
            await daiAggregatorV3Contract.getAddress(),
        ]);
    });

    it("Fails when trying to initialize aggregator contract", async () => {
        await expect(cvgAggregatorV3Contract.connect(user1).initialize(user1, "20", "Toke")).to.be.revertedWith(
            "Initializable: contract is already initialized"
        );
    });
    it("Fails when trying to initialize base contract", async () => {
        await expect(baseAggregatorContract.connect(user1).initialize(user1, "20", "Toke")).to.be.revertedWith(
            "Initializable: contract is already initialized"
        );
    });

    it("Should change the latest price", async () => {
        const PRICE_CVG = "2000000000000000000";
        const receiptUpdatePriceCvg = await (await cvgAggregatorV3Contract.connect(treasuryDao).setLatestPrice(PRICE_CVG)).wait();
        const eventsCvg = receiptUpdatePriceCvg.logs.filter((e) => e?.fragment?.name === "SetLatestPrice");
        const priceCvgEmitted = eventsCvg[0].args[0];
        const latestCvgPrice = await cvgAggregatorV3Contract.latestRoundData();
        expect(priceCvgEmitted).to.be.eq(PRICE_CVG);
        expect(latestCvgPrice[1]).to.be.eq(PRICE_CVG);

        const PRICE_TOKE = "1000000000000000000";
        const receiptUpdatePriceToke = await (await cvgAggregatorV3Contract.connect(treasuryDao).setLatestPrice(PRICE_TOKE)).wait();
        const eventsToke = receiptUpdatePriceToke.logs.filter((e) => e?.fragment?.name === "SetLatestPrice");
        const priceTokeEmitted = eventsToke[0].args[0];
        const latestTokePrice = await cvgAggregatorV3Contract.latestRoundData();
        expect(priceTokeEmitted).to.be.eq(PRICE_TOKE);
        expect(latestTokePrice[1]).to.be.eq(PRICE_TOKE);

        const PRICE_CNC = "3000000000000000000";
        const receiptUpdatePriceCnc = await (await cvgAggregatorV3Contract.connect(treasuryDao).setLatestPrice(PRICE_CNC)).wait();
        const eventsCnc = receiptUpdatePriceCnc.logs.filter((e) => e?.fragment?.name === "SetLatestPrice");
        const priceCncEmitted = eventsCnc[0].args[0];
        const latestCncPrice = await cvgAggregatorV3Contract.latestRoundData();
        expect(priceCncEmitted).to.be.eq(PRICE_CNC);
        expect(latestCncPrice[1]).to.be.eq(PRICE_CNC);

        const PRICE_STD = "10000000000000000000";
        const receiptUpdatePriceStd = await (await cvgAggregatorV3Contract.connect(treasuryDao).setLatestPrice(PRICE_STD)).wait();
        const eventsStd = receiptUpdatePriceStd.logs.filter((e) => e?.fragment?.name === "SetLatestPrice");
        const priceStdEmitted = eventsStd[0].args[0];
        const latestStdPrice = await cvgAggregatorV3Contract.latestRoundData();
        expect(priceStdEmitted).to.be.eq(PRICE_STD);
        expect(latestStdPrice[1]).to.be.eq(PRICE_STD);
    });

    it("Fails when change the latest price with not an owner", async () => {
        await expect(cvgAggregatorV3Contract.connect(user1).setLatestPrice("100055")).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(tokeAggregatorV3Contract.connect(user2).setLatestPrice("2054888888888884444444444")).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );

        await expect(cncAggregatorV3Contract.connect(user3).setLatestPrice("5158888888888")).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(stdAggregatorV3Contract.connect(user1).setLatestPrice("2")).to.be.revertedWith("Ownable: caller is not the owner");
    });
});
