const hre = require("hardhat");

const deployPresaleSeed = async (contracts, multisig) => {
    const dai = contracts.tokenContracts.DAI;
    const frax = contracts.tokenContracts.FRAX;
    // deploy presale SC
    const PresaleContractSeed = await ethers.getContractFactory("SeedPresaleCvg");
    const presaleContractSeed = await PresaleContractSeed.deploy(dai.address, frax.address, multisig);
    await presaleContractSeed.deployed();

    // make contract available for tests
    return {
        ...contracts,
        ...{presaleContractSeed, dai, frax},
    };
};
module.exports = deployPresaleSeed;
