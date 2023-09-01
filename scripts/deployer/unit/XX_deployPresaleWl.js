const hre = require("hardhat");
const GlobalHelper = require("../../../utils/GlobalHelper");

const deployPresaleWl = async (contracts, users) => {
    const dai = contracts.tokenContracts.daiContract;
    const frax = contracts.tokenContracts.fraxContract;

    //get rootMerkles
    const wlAddressesS = [users.user7.address, users.user8.address, users.user9.address, users.user10.address];
    const wlAddressesM = [users.user4.address, users.user5.address, users.user6.address];
    const wlAddressesL = [users.user1.address, users.user2.address, users.user3.address];

    const rootWlS = GlobalHelper.getRoot(wlAddressesS);
    const rootWlM = GlobalHelper.getRoot(wlAddressesM);
    const rootWlL = GlobalHelper.getRoot(wlAddressesL);

    const presaleContractWl = await hre.ethers.deployContract("WlPresaleCvg", [rootWlS, rootWlM, rootWlL, dai, frax, users.treasuryDao]);
    await presaleContractWl.waitForDeployment();

    return {
        ...contracts,
        ...{presaleContractWl, wlAddressesS, wlAddressesM, wlAddressesL},
    };
};
module.exports = deployPresaleWl;
