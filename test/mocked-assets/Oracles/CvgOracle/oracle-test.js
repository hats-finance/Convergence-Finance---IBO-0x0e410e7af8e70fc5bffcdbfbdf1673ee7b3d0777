const { expect } = require("chai");
const ApiHelper = require("../../../ApiHelper");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployOracleFixture } = require("../../../fixtures/fixtures");

describe("Oracle Testing", () => {
  const deltaPercentage = 0.04; // 4% error marging with coingecko API
  const UNIV3 = 0;
  const UNIV2 = 1;
  const CURVE_NORMAL = 2;
  const CURVE_TRIPOOL = 3;

  let treasuryDao;

  let convergencePriceOracleContract;
  let prices;
  let tokens = [];

  before(async () => {
    const { contracts, users } = await loadFixture(deployOracleFixture);

    const tokenContracts = contracts.tokenContracts;

    tokens = [
      {
        token: tokenContracts.wethContract,
        name: "ethereum",
        poolType: UNIV3,
        isReversed: true,
        isEthPriceRelated: false,
        poolAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
      },
      {
        token: tokenContracts.crvContract,
        name: "curve-dao-token",
        poolType: CURVE_TRIPOOL,
        isReversed: false,
        isEthPriceRelated: true,
        poolAddress: "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511",
      },
      {
        token: tokenContracts.cvxContract,
        name: "convex-finance",
        poolType: CURVE_NORMAL,
        isReversed: false,
        isEthPriceRelated: true,
        poolAddress: "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4",
      },
      {
        token: tokenContracts.sdtContract,
        name: "stake-dao",
        poolType: CURVE_NORMAL,
        isReversed: false,
        isEthPriceRelated: true,
        poolAddress: "0xfB8814D005C5f32874391e888da6eB2fE7a27902",
      },
      {
        token: tokenContracts.cncContract,
        name: "conic-finance",
        poolType: CURVE_NORMAL,
        isReversed: false,
        isEthPriceRelated: true,
        poolAddress: "0x838af967537350D2C44ABB8c010E49E32673ab94",
      },

      {
        token: tokenContracts.tokeContract,
        name: "tokemak",
        poolType: UNIV2,
        isReversed: true,
        isEthPriceRelated: true,
        poolAddress: "0xd4e7a6e2D03e4e48DfC27dd3f46DF1c176647E38",
      },
      {
        token: tokenContracts.fxsContract,
        name: "frax-share",
        poolType: UNIV2,
        isReversed: false,
        isEthPriceRelated: false,
        poolAddress: "0x03B59Bd1c8B9F6C265bA0c3421923B93f15036Fa",
      },
    ];
    prices = await ApiHelper.getCoinGeckoTokenPrices(
      [
        "ethereum",
        "curve-dao-token",
        "convex-finance",
        "stake-dao",
        "conic-finance",
        "tokemak",
        "frax-share",
      ],
      "usd"
    );
    treasuryDao = users.treasuryDao;

    convergencePriceOracleContract = contracts.convergencePriceOracleContract;
  });

  it("Verify Price should compute true", async () => {
    await convergencePriceOracleContract.getAndVerifyCvgPrice();
  });

  it("Should compute Token prices in $ ", async () => {
    for (const token of tokens) {
      const priceInPool = (
        await convergencePriceOracleContract.getPriceOracle(token.token)
      )[0];
      const priceRaw = ethers.formatEther(priceInPool);
      const price = Number(priceRaw);
      const expectedPrice = prices[token.name].usd;
      expect(price).to.be.approximately(
        expectedPrice,
        expectedPrice * deltaPercentage
      );
    }
  });
});
