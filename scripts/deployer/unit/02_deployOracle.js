const hre = require("hardhat");
const {TOKENS} = require("../../config");
const deployOracleContract = async (contracts, users, isIbo = false) => {
    const convergencePriceOracleContract = await hre.ethers.deployContract("CvgOracle", [users.treasuryDao.address]);
    await convergencePriceOracleContract.waitForDeployment();

    const tokenOraclized = [TOKENS.DAI, TOKENS.FRAX, TOKENS.CNC, TOKENS.CRV, TOKENS.CVX, TOKENS.FXS, TOKENS.SDT, TOKENS.TOKE, TOKENS.WETH, TOKENS.USDC];

    for (const TOKEN of tokenOraclized) {
        await convergencePriceOracleContract.connect(users.treasuryDao).setTokenOracleParams(TOKEN.address, {
            poolType: TOKEN.bond_config.oracleParams.poolType,
            poolAddress: TOKEN.bond_config.oracleParams.poolAddress,
            isStable: TOKEN.bond_config.isStable,
            isReversed: TOKEN.bond_config.oracleParams.isReversed,
            isEthPriceRelated: TOKEN.bond_config.oracleParams.isEthPriceRelated,
            aggregatorOracle: TOKEN.bond_config.oracleParams.aggregatorOracle,
            deltaAggregatorCvgOracle: TOKEN.bond_config.oracleParams.deltaAggregatorCvgOracle, // 10% delta error allowed
            twapInterval: 0,
            maxLastUpdateAggregator: 800_600_400,
        });
    }
    if (!isIbo) {
        await convergencePriceOracleContract.connect(users.treasuryDao).setCvgToken(contracts.cvgContract);
        await convergencePriceOracleContract.connect(users.treasuryDao).setTokenOracleParams(contracts.cvgContract, {
            poolType: 2,
            poolAddress: contracts.cvgPoolContract,
            isReversed: false,
            isStable: false,
            isEthPriceRelated: false,
            aggregatorOracle: contracts.cvgAggregatorV3,
            deltaAggregatorCvgOracle: 1000, // 10% delta error allowed
            twapInterval: 0,
            maxLastUpdateAggregator: 800_600_400,
        });
        await (await contracts.controlTowerContract.connect(users.treasuryDao).setOracle(convergencePriceOracleContract)).wait();
    }

    return {...contracts, ...{convergencePriceOracleContract}};
};
module.exports = deployOracleContract;
