const linkPreseed = async (contracts) => {
    const presaleContractSeed = await ethers.getContractAt("SeedPresaleCvg", "0x06feb7a047e540b8d92620a2c13ec96e1ff5e19b");
    return {
        ...contracts,
        ...{presaleContractSeed},
    };
};

module.exports = linkPreseed;
