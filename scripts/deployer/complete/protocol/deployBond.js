const h = require("../helper");

const deployBond = async () => {
    const users = await ethers.getSigners();
    const owner = users[0];
    const treasuryDao = users[13];
    const treasuryStaking = users[14];
    const treasuryBonds = users[15];

    // Contracts
    const CONTROL_TOWER_CONTRACT = "CvgControlTower";
    const BOND_CALCULATOR_CONTRACT = "BondCalculator";

    // Deploy BondCalculator Contract
    const DEPLOY_BOND_CALCULATOR_CONTRACT = "DEPLOY_BOND_CALCULATOR_CONTRACT";
    if (!h.getTrigger(DEPLOY_BOND_CALCULATOR_CONTRACT)) {
        const bondCalculatorContract = await hre.ethers.deployContract(BOND_CALCULATOR_CONTRACT, []);
        await bondCalculatorContract.waitForDeployment();

        console.log("bond calculator deployed");
        h.writeFile(BOND_CALCULATOR_CONTRACT, await bondCalculatorContract.getAddress(), DEPLOY_BOND_CALCULATOR_CONTRACT);
    }

    // Set the Bond Calculator address in the ControlTower
    const SET_BOND_CALCULATOR_IN_CONTROL_TOWER = "SET_BOND_CALCULATOR_IN_CONTROL_TOWER";
    if (!h.getTrigger(SET_BOND_CALCULATOR_IN_CONTROL_TOWER)) {
        const controlTowerContract = await h.getContract(CONTROL_TOWER_CONTRACT);
        await (await controlTowerContract.connect(treasuryDao).setBondCalculator(h.getAddress(BOND_CALCULATOR_CONTRACT))).wait();
        console.log("Bond calculator setted");
        h.writeFile(null, null, SET_BOND_CALCULATOR_IN_CONTROL_TOWER);
    }
};

module.exports = deployBond;
