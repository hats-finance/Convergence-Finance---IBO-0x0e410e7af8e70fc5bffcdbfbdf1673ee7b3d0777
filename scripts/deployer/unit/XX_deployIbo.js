const hre = require("hardhat");
const GlobalHelper = require("../../../utils/GlobalHelper");
const deployIbo = async (contracts, users) => {
    const pepeWl = [users.user1.address, users.user7.address, users.user8.address, users.user9.address, users.user10.address];
    const classicWl = [users.user2.address, users.user3.address, users.user4.address, users.user5.address, users.user6.address];

    const rootPepe = GlobalHelper.getRoot(pepeWl);
    const rootWl = GlobalHelper.getRoot(classicWl);

    const iboContract = await hre.ethers.deployContract("Ibo", [
        users.treasuryBonds,
        contracts.bondCalculatorContract,
        contracts.convergencePriceOracleContract,
        rootPepe,
        rootWl,
    ]);
    await iboContract.waitForDeployment();

    return {...contracts, ...{iboContract, pepeWl, classicWl}};
};

module.exports = deployIbo;
