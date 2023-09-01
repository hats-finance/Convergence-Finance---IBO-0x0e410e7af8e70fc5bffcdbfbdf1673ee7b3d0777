const GlobalHelper = require("../../../../utils/GlobalHelper");
const h = require("../helper");

const {ethers} = require("hardhat");

const deployPresaleVesting = async () => {
    const users = await ethers.getSigners();
    const owner = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const user3 = users[3];
    const user4 = users[4];
    const user5 = users[5];
    const user6 = users[6];
    const user7 = users[7];
    const user8 = users[8];
    const user9 = users[9];
    const user10 = users[10];
    const user11 = users[11];
    const user12 = users[12];
    const treasuryDao = users[13];
    const treasuryStaking = users[14];
    const treasuryBonds = users[15];
    const airdropMultisig = users[17];

    // Contracts
    const CONTROL_TOWER_CONTRACT = "CvgControlTower";
    const CVG_CONTRACT = "Cvg";
    const PRESALE_SEED_CONTRACT = "SeedPresaleCvg";
    const PRESALE_WL_CONTRACT = "WlPresaleCvg";
    const VESTING_CONTRACT = "VestingCvg";
    const CVG_PEPE_CONTRACT = "CvgPepe";
    const IBO_CONTRACT = "Ibo";
    const BOND_CALCULATOR_CONTRACT = "BondCalculator";
    const ORACLE_CONTRACT = "CvgOracle";

    // Link Presale Seed Contract
    const LINK_PRESALE_SEED_CONTRACT = "LINK_PRESALE_SEED_CONTRACT";
    if (!h.getTrigger(LINK_PRESALE_SEED_CONTRACT)) {
        const seedPresaleContract = await ethers.getContractAt(PRESALE_SEED_CONTRACT, "0x06FEB7a047e540B8d92620a2c13Ec96e1FF5E19b");
        console.log("presale seed linked");
        h.writeFile(PRESALE_SEED_CONTRACT, await seedPresaleContract.getAddress(), LINK_PRESALE_SEED_CONTRACT);
    }
    // Link Presale Wl Contract
    const LINK_PRESALE_WL_CONTRACT = "LINK_PRESALE_WL_CONTRACT";
    if (!h.getTrigger(LINK_PRESALE_WL_CONTRACT)) {
        const wlPresaleContract = await ethers.getContractAt(PRESALE_WL_CONTRACT, "0xc9740aa94a8a02a3373f5f1b493d7e10d99ae811");
        await wlPresaleContract.waitForDeployment();
        h.writeFile(PRESALE_WL_CONTRACT, await wlPresaleContract.getAddress(), LINK_PRESALE_WL_CONTRACT);
        console.log("presale wl linked");
    }

    // Link Pepe Contract
    const LINK_PEPE_CONTRACT = "LINK_PEPE_CONTRACT";
    if (!h.getTrigger(LINK_PEPE_CONTRACT)) {
        const cvgPepeContract = await ethers.getContractAt(CVG_PEPE_CONTRACT, "0x822ee3715e2c15372e45a4a62376bf786ff45511");
        await cvgPepeContract.waitForDeployment();
        h.writeFile(CVG_PEPE_CONTRACT, await cvgPepeContract.getAddress(), LINK_PEPE_CONTRACT);
        console.log("pepe linked");
    }

    const pepeWl = [user1.address, user7.address, user8.address, user9.address, user10.address];
    const classicWl = [user2.address, user3.address, user4.address, user5.address, user6.address];

    const rootPepe = GlobalHelper.getRoot(pepeWl);
    const rootWl = GlobalHelper.getRoot(classicWl);

    // Deploy Ibo Contract
    const DEPLOY_IBO_CONTRACT = "DEPLOY_IBO_CONTRACT";
    if (!h.getTrigger(DEPLOY_IBO_CONTRACT)) {
        const iboContract = await hre.ethers.deployContract(IBO_CONTRACT, [
            treasuryBonds,
            h.getAddress(BOND_CALCULATOR_CONTRACT),
            h.getAddress(ORACLE_CONTRACT),
            rootPepe,
            rootWl,
        ]);
        await iboContract.waitForDeployment();
        h.writeFile(IBO_CONTRACT, await iboContract.getAddress(), DEPLOY_IBO_CONTRACT);
        console.log("Ibo deployed");
    }

    // Deploy Vesting Contract
    const DEPLOY_VESTING_CONTRACT = "DEPLOY_VESTING_CONTRACT";
    if (!h.getTrigger(DEPLOY_VESTING_CONTRACT)) {
        const vestingContract = await hre.ethers.deployContract(VESTING_CONTRACT, [
            h.getAddress(CONTROL_TOWER_CONTRACT),
            h.getAddress(PRESALE_WL_CONTRACT),
            h.getAddress(PRESALE_SEED_CONTRACT),
            h.getAddress(IBO_CONTRACT),
        ]);
        await vestingContract.waitForDeployment();
        h.writeFile(VESTING_CONTRACT, await vestingContract.getAddress(), DEPLOY_VESTING_CONTRACT);
        console.log("vesting deployed");
    }

    // Set the Vesting Cvg address in the ControlTower
    const SET_VESTING_CVG_IN_CONTROL_TOWER = "SET_VESTING_CVG_IN_CONTROL_TOWER";
    if (!h.getTrigger(SET_VESTING_CVG_IN_CONTROL_TOWER)) {
        const controlTowerContract = await h.getContract(CONTROL_TOWER_CONTRACT);
        await (await controlTowerContract.connect(treasuryDao).setVestingCvg(h.getAddress(VESTING_CONTRACT))).wait();
        h.writeFile(null, null, SET_VESTING_CVG_IN_CONTROL_TOWER);
        console.log("vesting cvg setted");
    }
    // Set the Cvg address in the Vesting Contract
    const SET_CVG_VESTING = "SET_CVG_VESTING";
    if (!h.getTrigger(SET_CVG_VESTING)) {
        const vestingCvgContract = await h.getContract(VESTING_CONTRACT);
        await (await vestingCvgContract.connect(treasuryDao).setCvg(h.getAddress(CVG_CONTRACT))).wait();
        h.writeFile(null, null, SET_CVG_VESTING);
        console.log("cvg setted on vesting");
    }

    // Send Cvg to vesting contract
    const SEND_CVG_VESTING_CONTRACT = "SEND_CVG_VESTING_CONTRACT";
    if (!h.getTrigger(SEND_CVG_VESTING_CONTRACT)) {
        const cvgContract = await h.getContract(CVG_CONTRACT);
        //Send CVG for VC/PRESEED vesting
        await cvgContract.transfer(h.getAddress(VESTING_CONTRACT), "10300000000000000000000000"); //10_300_000 CVG
        //Send TOTAL CVG for WL vestings
        await cvgContract.transfer(h.getAddress(VESTING_CONTRACT), "2450000000000000000000000"); //2_450_000 CVG => TOTAL : 12_750_000 CVG

        const balanceOf = await cvgContract.balanceOf(owner.address);
        await cvgContract.transfer(h.getAddress(VESTING_CONTRACT), balanceOf); //27_509_697 REST OF CVG MINTED
        h.writeFile(null, null, SEND_CVG_VESTING_CONTRACT);
        console.log("cvg tokens sent to vesting contract");
    }
};

module.exports = deployPresaleVesting;
