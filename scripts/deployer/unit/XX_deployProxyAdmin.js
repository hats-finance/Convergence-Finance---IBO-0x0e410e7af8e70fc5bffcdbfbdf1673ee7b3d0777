const hre = require("hardhat");

const deployProxyAdmin = async (contracts, users) => {
    const proxyAdmin = await hre.ethers.deployContract("ProxyAdmin", [users.treasuryDao.address]);
    await proxyAdmin.waitForDeployment();
    return {...contracts, ...{proxyAdmin}};
};
module.exports = deployProxyAdmin;
