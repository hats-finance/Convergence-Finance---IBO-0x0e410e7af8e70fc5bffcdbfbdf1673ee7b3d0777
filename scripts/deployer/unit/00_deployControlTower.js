const hre = require("hardhat");
const GlobalHelper = require("../../../utils/GlobalHelper");

const deployControlTowerContract = async (contracts, users) => {
    const sigParams = "address,address,address";
    const params = [users.treasuryBonds.address, users.treasuryStaking.address, users.treasuryDao.address];
    const controlTowerContract = await GlobalHelper.deployProxy(sigParams, params, "CvgControlTower", contracts.proxyAdmin);
    return {...contracts, ...{controlTowerContract}};
};
module.exports = deployControlTowerContract;
