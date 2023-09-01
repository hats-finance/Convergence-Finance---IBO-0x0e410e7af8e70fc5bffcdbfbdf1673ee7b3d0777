const hre = require("hardhat");

const deployVestingContract = async (contracts) => {
    const vestingContract = await hre.ethers.deployContract("VestingCvg", [
        contracts.controlTowerContract,
        contracts.presaleContractWl,
        contracts.presaleContractSeed,
        contracts.iboContract,
    ]);
    await vestingContract.waitForDeployment();

    return {...contracts, ...{vestingContract}};
};
module.exports = deployVestingContract;
