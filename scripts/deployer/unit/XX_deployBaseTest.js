const hre = require("hardhat");

const deployBaseTest = async (contracts) => {
    const baseTestContract = await ethers.deployContract("BaseTest", []);
    await baseTestContract.waitForDeployment();

    return {...contracts, ...{baseTestContract}};
};
module.exports = deployBaseTest;
