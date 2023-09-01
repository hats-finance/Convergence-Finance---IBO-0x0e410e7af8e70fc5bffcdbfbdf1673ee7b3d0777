const hre = require("hardhat");
const {MAX_INTEGER, zeroAddress} = require("@nomicfoundation/ethereumjs-util");
const {TOKENS, REAL_IBO_PARAMETERS} = require("../../scripts/config");
const TestHelper = require("../TestHelper");

const {time} = require("@nomicfoundation/hardhat-network-helpers");

const bedTestVestingDistributeInitTokens = async (contracts, users) => {
    const dai = contracts.tokenContracts.daiContract;
    const frax = contracts.tokenContracts.fraxContract;

    const presaleContractSeed = contracts.presaleContractSeed;
    const presaleContractWl = contracts.presaleContractWl;

    // approve max amount for every user
    await dai.connect(users.user1).approve(presaleContractSeed, MAX_INTEGER);
    await dai.connect(users.user3).approve(presaleContractSeed, MAX_INTEGER);
    await dai.connect(users.user5).approve(presaleContractSeed, MAX_INTEGER);
    await dai.connect(users.user6).approve(presaleContractSeed, MAX_INTEGER);
    await frax.connect(users.user2).approve(presaleContractSeed, MAX_INTEGER);
    await frax.connect(users.user4).approve(presaleContractSeed, MAX_INTEGER);

    await dai.connect(users.user1).approve(presaleContractWl, MAX_INTEGER);
    await frax.connect(users.user2).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user7).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user8).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user9).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user10).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user11).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user12).approve(presaleContractWl, MAX_INTEGER);

    await frax.connect(users.user4).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user5).approve(presaleContractWl, MAX_INTEGER);
};

const bedTestVestingMintSeedTokens = async (contracts, users) => {
    const preseedContract = await ethers.getContractAt("SeedPresaleCvg", "0x06feb7a047e540b8d92620a2c13ec96e1ff5e19b");

    contracts.presaleContractSeed = preseedContract;
};

const bedTestVestingMintWlTokens = async (contracts, users) => {
    // we fund our user with DAI tokens
    const dai = contracts.tokenContracts.daiContract;
    const frax = contracts.tokenContracts.fraxContract;
    const presaleContractWl = contracts.presaleContractWl;

    // approve max amount for every user
    await dai.connect(users.user1).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user2).approve(presaleContractWl, MAX_INTEGER);
    await frax.connect(users.user4).approve(presaleContractWl, MAX_INTEGER);
    await frax.connect(users.user5).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user7).approve(presaleContractWl, MAX_INTEGER);
    await frax.connect(users.user9).approve(presaleContractWl, MAX_INTEGER);
    await dai.connect(users.user10).approve(presaleContractWl, MAX_INTEGER);

    const merkleProof7 = TestHelper.getProofMerkle(contracts.wlAddressesS, users.user7.address);
    await presaleContractWl.connect(users.user7).investMint(merkleProof7, ethers.parseEther("200"), true, 2); // 200 to 7 with DAI & SMALL

    const merkleProof4 = TestHelper.getProofMerkle(contracts.wlAddressesM, users.user4.address);
    await presaleContractWl.connect(users.user4).investMint(merkleProof4, ethers.parseEther("1200"), false, 3); // 1200 to 4 with FRAX & MEDIUM

    const merkleProof1 = TestHelper.getProofMerkle(contracts.wlAddressesL, users.user1.address);
    await presaleContractWl.connect(users.user1).investMint(merkleProof1, ethers.parseEther("2000"), true, 4); // 2000 to 1 with DAI & LARGE
};

const bedTestIboMinting = async (contracts, users) => {
    await time.increase(60 * 69);
    // we fund our user with DAI tokens
    const crv = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.CRV.address);
    const cvx = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.CVX.address);
    const frax = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.FRAX.address);
    const iboContract = contracts.iboContract;

    // approve max amount for every user
    await frax.connect(users.user10).approve(iboContract, MAX_INTEGER);
    await frax.connect(users.user11).approve(iboContract, MAX_INTEGER);
    await iboContract.connect(users.treasuryBonds).createBond(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS);

    await iboContract.connect(users.user10).deposit(0, 1, ethers.parseEther("500"), ethers.parseEther("1000"), 0, [ethers.ZeroHash]); // 200 to 7 with DAI & SMALL
    // Finish the IBO
    await hre.network.provider.send("evm_increaseTime", [7 * 86400]);
    await hre.network.provider.send("hardhat_mine", []);
};
module.exports = {bedTestVestingDistributeInitTokens, bedTestVestingMintWlTokens, bedTestVestingMintSeedTokens, bedTestIboMinting};
