const h = require("../helper");

const deployClone = async () => {
    const users = await ethers.getSigners();
    const owner = users[0];
    const treasuryDao = users[13];
    const treasuryStaking = users[14];
    const treasuryBonds = users[15];

    // Contracts
    const CONTROL_TOWER_CONTRACT = "CvgControlTower";
    const BASE_AGGREGATOR_CONTRACT = "CvgV3Aggregator";

    // Deploy Base Aggregator
    const DEPLOY_BASE_AGGREGATOR_CONTRACT = "DEPLOY_BASE_AGGREGATOR_CONTRACT";
    if (!h.getTrigger(DEPLOY_BASE_AGGREGATOR_CONTRACT)) {
        const baseAggregatorContract = await hre.ethers.deployContract(BASE_AGGREGATOR_CONTRACT, []);
        await baseAggregatorContract.waitForDeployment();

        h.writeFile(BASE_AGGREGATOR_CONTRACT, await baseAggregatorContract.getAddress(), DEPLOY_BASE_AGGREGATOR_CONTRACT);
        console.log("base aggregator deployed");
    }

    // Set the Base Aggregator address in the ControlTower
    const SET_BASE_AGGREGATOR_IN_CONTROL_TOWER = "SET_BASE_AGGREGATOR_IN_CONTROL_TOWER";
    if (!h.getTrigger(SET_BASE_AGGREGATOR_IN_CONTROL_TOWER)) {
        const controlTowerContract = await h.getContract(CONTROL_TOWER_CONTRACT);
        await (await controlTowerContract.connect(treasuryDao).setNewVersionBaseAggregator(h.getAddress(BASE_AGGREGATOR_CONTRACT))).wait();
        h.writeFile(null, null, SET_BASE_AGGREGATOR_IN_CONTROL_TOWER);
        console.log("base aggregator setted");
    }
};

module.exports = deployClone;
