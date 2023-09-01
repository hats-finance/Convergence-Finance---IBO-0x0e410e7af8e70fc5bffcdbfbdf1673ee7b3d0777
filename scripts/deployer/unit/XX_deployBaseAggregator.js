const deployBaseAggregatorContract = async (contracts, users) => {
    const baseAggregatorContract = await ethers.deployContract("CvgV3Aggregator", []);
    await baseAggregatorContract.waitForDeployment();

    await (await contracts.controlTowerContract.connect(users.treasuryDao).setNewVersionBaseAggregator(baseAggregatorContract)).wait();
    return {...contracts, ...{baseAggregatorContract}};
};

module.exports = deployBaseAggregatorContract;
