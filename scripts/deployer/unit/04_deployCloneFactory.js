const hre = require("hardhat");
const GlobalHelper = require("../../../utils/GlobalHelper");

const deployCloneFactoryContract = async (contracts, users) => {
    const sigParams = "address";
    const params = [await contracts.controlTowerContract.getAddress()];
    const cloneFactoryContract = await GlobalHelper.deployProxy(sigParams, params, "CloneFactory", contracts.proxyAdmin);

    await (await contracts.controlTowerContract.connect(users.treasuryDao).setCloneFactory(cloneFactoryContract)).wait();

    return {...contracts, ...{cloneFactoryContract}};
};
module.exports = deployCloneFactoryContract;
