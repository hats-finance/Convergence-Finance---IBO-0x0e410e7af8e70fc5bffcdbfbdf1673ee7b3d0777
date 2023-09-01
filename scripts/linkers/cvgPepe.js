const linkCvgPepe = async (contracts) => {
    const cvgPepeContract = await ethers.getContractAt("CvgPepe", "0x822ee3715e2c15372e45a4a62376bF786fF45511");

    // make contract available for tests
    return {
        ...contracts,
        ...{cvgPepeContract},
    };
};

module.exports = linkCvgPepe;
