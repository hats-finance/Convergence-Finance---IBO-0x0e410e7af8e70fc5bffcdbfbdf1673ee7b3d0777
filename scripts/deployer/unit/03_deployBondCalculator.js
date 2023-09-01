const hre = require("hardhat");

const deployBondCalculatorContract = async (contracts, users, isIbo = false) => {
    const bondCalculatorContract = await hre.ethers.deployContract("BondCalculator", []);
    await bondCalculatorContract.waitForDeployment();

    if (!isIbo) {
        await (await contracts.controlTowerContract.connect(users.treasuryDao).setBondCalculator(bondCalculatorContract)).wait();
    }

    return {...contracts, ...{bondCalculatorContract}};
};
module.exports = deployBondCalculatorContract;
