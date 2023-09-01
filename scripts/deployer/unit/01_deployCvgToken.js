const hre = require("hardhat");

// TODO /!\  Care to dont let the minting on mainnet
const deployCvgTokenContract = async (contracts, users, receiverVestingSupply) => {
    const cvgContract = await hre.ethers.deployContract("Cvg", [contracts.controlTowerContract, receiverVestingSupply, users.airdropMultisig]);
    await cvgContract.waitForDeployment();

    const MAX_AIRDROP = await cvgContract.MAX_AIRDROP();

    await (await cvgContract.connect(users.airdropMultisig).mintAirdrop(users.airdropMultisig, MAX_AIRDROP)).wait();
    await (await contracts.controlTowerContract.connect(users.treasuryDao).setCvg(cvgContract)).wait();

    return {...contracts, ...{cvgContract}};
};
module.exports = deployCvgTokenContract;
