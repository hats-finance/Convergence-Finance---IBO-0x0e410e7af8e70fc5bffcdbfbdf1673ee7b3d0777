const hre = require("hardhat");
const GlobalHelper = require("../../../utils/GlobalHelper");
const helper = new GlobalHelper();

const deployCvgPepe = async (contracts, users) => {
    const CvgPepeContractFactory = await ethers.getContractFactory("CvgPepe");

    const uri = "ipfs://QmUjq34dyKmjzXw2Tt8vTEScYH9mPtDKrFk7Mc8gtnJ9gH/";
    const cvgPepeContract = await CvgPepeContractFactory.deploy(uri);
    await cvgPepeContract.deployed();

    listing = [users.user1.address, users.user2.address, users.user3.address, users.user4.address];
    const merkleRoot = await helper.getRoot(listing);
    await cvgPepeContract.setMerkleRoot(merkleRoot);

 

    // make contract available for tests
    return {
        ...contracts,
        ...{cvgPepeContract},
    };
};

module.exports = deployCvgPepe;
