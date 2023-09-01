const deployControlTowerContract = require("./00_deployControlTower");
const deployCvgTokenContract = require("./01_deployCvgToken");
const deployOracleContract = require("./02_deployOracle");
const deployBondCalculatorContract = require("./03_deployBondCalculator");
const deployCloneFactoryContract = require("./04_deployCloneFactory");
const deployAggregatorClones = require("./XX_deployCvgAggregatorClones");
const deployPresaleSeed = require("./XX_deployPresaleSeed");
const deployPresaleWl = require("./XX_deployPresaleWl");
const deployVestingCvg = require("./XX_deployVestingCvg");
const deployFakeAsset = require("./XX_deployFakeAsset");
const deployCvgPepe = require("./XX_deployCvgPepe");
const deployBaseAggregatorContract = require("./XX_deployBaseAggregator");
const deployProxyAdmin = require("./XX_deployProxyAdmin");
const deployIboContract = require("./XX_deployIbo");

module.exports = {
    deployBaseAggregatorContract,
    deployCvgTokenContract,
    deployAggregatorClones,
    deployOracleContract,
    deployCloneFactoryContract,
    deployBondCalculatorContract,
    deployPresaleSeed,
    deployControlTowerContract,
    deployPresaleWl,
    deployFakeAsset,
    deployVestingCvg,
    deployCvgPepe,
    deployProxyAdmin,
    deployIboContract,
};
