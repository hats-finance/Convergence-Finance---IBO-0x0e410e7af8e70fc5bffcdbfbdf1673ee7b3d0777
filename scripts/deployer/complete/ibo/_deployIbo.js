const {parseEther} = require("ethers");
const TestHelper = require("../../../../test/TestHelper");
const giveTokensToAddresses = require("../../../../utils/thiefv2");
const {TOKENS, REAL_IBO_PARAMETERS, REAL_VESTING_SCHEDULES} = require("../../../config");
const IBO_CONTRACT = "Ibo";
const BOND_CALCULATOR_CONTRACT = "BondCalculator";
const ORACLE_CONTRACT = "CvgOracle";
const PRESALE_SEED_CONTRACT = "SeedPresaleCvg";
const PRESALE_WL_CONTRACT = "WlPresaleCvg";
const VESTING_CONTRACT = "VestingCvg";
const PROXY_ADMIN = "ProxyAdmin";
const CONTROL_TOWER_CONTRACT = "CvgControlTower";
const CVG_CONTRACT = "Cvg";
const h = require("../helper");
const GlobalHelper = require("../../../../utils/GlobalHelper");
const {time} = require("@nomicfoundation/hardhat-network-helpers");
const protocolDeployers = require("../protocol/index");

async function main() {
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

    await giveTokensToAddresses(users, [
        {token: TOKENS.DAI, amount: parseEther("1000000")},
        {token: TOKENS.FRAX, amount: parseEther("1000000")},
        {token: TOKENS.WETH, amount: parseEther("1000000")},
        {token: TOKENS.CRV, amount: parseEther("1000000")},
        {token: TOKENS.CVX, amount: parseEther("1000000000000000000")},
    ]);
    const daiContract = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.DAI.address);

    const fraxContract = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.FRAX.address);
    const wethContract = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.WETH.address);
    const crvContract = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.CRV.address);
    const usdcContract = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.USDC.address);
    const usdtContract = await ethers.getContractAt(TestHelper.erc20ArtifactName, TOKENS.USDT.address);

    // Deploy Oracle Contract
    const DEPLOY_ORACLE_CONTRACT = "DEPLOY_ORACLE_CONTRACT";
    if (!h.getTrigger(DEPLOY_ORACLE_CONTRACT)) {
        const convergencePriceOracleContract = await hre.ethers.deployContract(ORACLE_CONTRACT, [treasuryDao]);
        await convergencePriceOracleContract.waitForDeployment();

        h.writeFile(ORACLE_CONTRACT, await convergencePriceOracleContract.getAddress(), DEPLOY_ORACLE_CONTRACT);
        console.log("oracle deployed");
    }
    // Set FRAX Parameters
    const SET_FRAX_ORACLE_PARAMETERS = "SET_FRAX_ORACLE_PARAMETERS";
    if (!h.getTrigger(SET_FRAX_ORACLE_PARAMETERS)) {
        const convergencePriceOracleContract = await h.getContract("CvgOracle");

        const frax = TOKENS.FRAX;
        await (
            await convergencePriceOracleContract.connect(treasuryDao).setTokenOracleParams(frax.address, {
                poolType: frax.bond_config.oracleParams.poolType,
                poolAddress: frax.bond_config.oracleParams.poolAddress,
                isStable: frax.bond_config.isStable,
                isReversed: frax.bond_config.oracleParams.isReversed,
                isEthPriceRelated: frax.bond_config.oracleParams.isEthPriceRelated,
                aggregatorOracle: frax.bond_config.oracleParams.aggregatorOracle,
                deltaAggregatorCvgOracle: frax.bond_config.oracleParams.deltaAggregatorCvgOracle, // 10% delta error allowed
                twapInterval: 0,
                maxLastUpdateAggregator: 800_600_400,
            })
        ).wait();
        h.writeFile(null, null, SET_FRAX_ORACLE_PARAMETERS);

        console.log("frax setup oracle");
    }

    // Set CRV Parameters
    const SET_CRV_ORACLE_PARAMETERS = "SET_CRV_ORACLE_PARAMETERS";
    if (!h.getTrigger(SET_CRV_ORACLE_PARAMETERS)) {
        const convergencePriceOracleContract = await h.getContract("CvgOracle");
        const crv = TOKENS.CRV;
        await (
            await convergencePriceOracleContract.connect(treasuryDao).setTokenOracleParams(crv.address, {
                poolType: crv.bond_config.oracleParams.poolType,
                poolAddress: crv.bond_config.oracleParams.poolAddress,
                isStable: crv.bond_config.isStable,
                isReversed: crv.bond_config.oracleParams.isReversed,
                isEthPriceRelated: crv.bond_config.oracleParams.isEthPriceRelated,
                aggregatorOracle: crv.bond_config.oracleParams.aggregatorOracle,
                deltaAggregatorCvgOracle: crv.bond_config.oracleParams.deltaAggregatorCvgOracle, // 10% delta error allowed
                twapInterval: 0,
                maxLastUpdateAggregator: 800_600_400,
            })
        ).wait();
        h.writeFile(null, null, SET_CRV_ORACLE_PARAMETERS);

        console.log("crv setup oracle");
    }

    // Set ETH Parameters
    const SET_WETH_ORACLE_PARAMETERS = "SET_WETH_ORACLE_PARAMETERS";
    if (!h.getTrigger(SET_WETH_ORACLE_PARAMETERS)) {
        const weth = TOKENS.WETH;
        const convergencePriceOracleContract = await h.getContract("CvgOracle");

        await (
            await convergencePriceOracleContract.connect(treasuryDao).setTokenOracleParams(weth.address, {
                poolType: weth.bond_config.oracleParams.poolType,
                poolAddress: weth.bond_config.oracleParams.poolAddress,
                isStable: weth.bond_config.isStable,
                isReversed: weth.bond_config.oracleParams.isReversed,
                isEthPriceRelated: weth.bond_config.oracleParams.isEthPriceRelated,
                aggregatorOracle: weth.bond_config.oracleParams.aggregatorOracle,
                deltaAggregatorCvgOracle: weth.bond_config.oracleParams.deltaAggregatorCvgOracle, // 10% delta error allowed
                twapInterval: 0,
                maxLastUpdateAggregator: 800_600_400,
            })
        ).wait();
        h.writeFile(null, null, SET_WETH_ORACLE_PARAMETERS);

        console.log("eth setup oracle");
    }

    // Set CVX Parameters
    const SET_CVX_ORACLE_PARAMETERS = "SET_CVX_ORACLE_PARAMETERS";
    if (!h.getTrigger(SET_CVX_ORACLE_PARAMETERS)) {
        const cvx = TOKENS.CVX;
        const convergencePriceOracleContract = await h.getContract("CvgOracle");

        await (
            await convergencePriceOracleContract.connect(treasuryDao).setTokenOracleParams(cvx.address, {
                poolType: cvx.bond_config.oracleParams.poolType,
                poolAddress: cvx.bond_config.oracleParams.poolAddress,
                isStable: cvx.bond_config.isStable,
                isReversed: cvx.bond_config.oracleParams.isReversed,
                isEthPriceRelated: cvx.bond_config.oracleParams.isEthPriceRelated,
                aggregatorOracle: cvx.bond_config.oracleParams.aggregatorOracle,
                deltaAggregatorCvgOracle: cvx.bond_config.oracleParams.deltaAggregatorCvgOracle, // 10% delta error allowed
                twapInterval: 0,
                maxLastUpdateAggregator: 800_600_400,
            })
        ).wait();
        h.writeFile(null, null, SET_CVX_ORACLE_PARAMETERS);

        console.log("cvx setup oracle");
    }

    // Deploy BondCalculator Contract
    const DEPLOY_BOND_CALCULATOR_CONTRACT = "DEPLOY_BOND_CALCULATOR_CONTRACT";
    if (!h.getTrigger(DEPLOY_BOND_CALCULATOR_CONTRACT)) {
        const bondCalculatorContract = await hre.ethers.deployContract(BOND_CALCULATOR_CONTRACT, []);
        await bondCalculatorContract.waitForDeployment();

        console.log("bond calculator deployed");
        h.writeFile(BOND_CALCULATOR_CONTRACT, await bondCalculatorContract.getAddress(), DEPLOY_BOND_CALCULATOR_CONTRACT);
    }

    const pepeWl = [user1.address, user7.address];
    const classicWl = [user2.address, user3.address];

    const rootPepe = GlobalHelper.getRoot(pepeWl);
    const rootWl = GlobalHelper.getRoot(classicWl);

    // Deploy Ibo Contract
    const DEPLOY_IBO_CONTRACT = "DEPLOY_IBO_CONTRACT";
    if (!h.getTrigger(DEPLOY_IBO_CONTRACT)) {
        let iboContract = await hre.ethers.deployContract(IBO_CONTRACT, [
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

    // Create the bond FRAX
    const CREATE_BOND_FRAX = "CREATE_BOND_FRAX";
    if (!h.getTrigger(CREATE_BOND_FRAX)) {
        const iboContract = await h.getContract(IBO_CONTRACT);
        await (await iboContract.connect(treasuryBonds).createBond(REAL_IBO_PARAMETERS.FRAX.BOND_PARAMETERS)).wait();
        console.log("Bond FRAX created");
        h.writeFile(null, null, CREATE_BOND_FRAX);
    }

    // Create the bond CRV
    const CREATE_BOND_CRV = "CREATE_BOND_CRV";
    if (!h.getTrigger(CREATE_BOND_CRV)) {
        const iboContract = await h.getContract(IBO_CONTRACT);
        await (await iboContract.connect(treasuryBonds).createBond(REAL_IBO_PARAMETERS.CRV.BOND_PARAMETERS)).wait();
        console.log("Bond CRV created");
        h.writeFile(null, null, CREATE_BOND_CRV);
    }

    // Create the bond CVX
    const CREATE_BOND_CVX = "CREATE_BOND_CVX";
    if (!h.getTrigger(CREATE_BOND_CVX)) {
        const iboContract = await h.getContract(IBO_CONTRACT);
        await (await iboContract.connect(treasuryBonds).createBond(REAL_IBO_PARAMETERS.CVX.BOND_PARAMETERS)).wait();
        console.log("Bond CVX created");
        h.writeFile(null, null, CREATE_BOND_CVX);
    }

    // Deploy ProxyAdmin
    const DEPLOY_PROXY_ADMIN = "DEPLOY_PROXY_ADMIN";
    if (!h.getTrigger(DEPLOY_PROXY_ADMIN)) {
        const proxyAdmin = await hre.ethers.deployContract(PROXY_ADMIN, [treasuryDao]);
        await proxyAdmin.waitForDeployment();
        h.writeFile(PROXY_ADMIN, await proxyAdmin.getAddress(), DEPLOY_PROXY_ADMIN);
    }

    // Deploy CvgControlTower
    const DEPLOY_CONTROL_TOWER = "DEPLOY_CONTROL_TOWER";
    if (!h.getTrigger(DEPLOY_CONTROL_TOWER)) {
        const blockNumber = await ethers.provider.getBlockNumber();
        const sigParams = "address,address,address";
        const params = [treasuryBonds.address, treasuryStaking.address, treasuryDao.address];
        const adminAddress = h.getAddress(PROXY_ADMIN);

        const controlTowerContract = await GlobalHelper.deployProxy(sigParams, params, CONTROL_TOWER_CONTRACT, adminAddress);

        h.writeFile(CONTROL_TOWER_CONTRACT, await controlTowerContract.getAddress(), DEPLOY_CONTROL_TOWER);
        h.writeBlockStart(blockNumber);

        console.log("controlTower: ", await controlTowerContract.getAddress());
        console.log("Block:", blockNumber);
    }

    // Deploy Vesting Contract
    const DEPLOY_VESTING_CONTRACT = "DEPLOY_VESTING_CONTRACT";
    if (!h.getTrigger(DEPLOY_VESTING_CONTRACT)) {
        const vestingContract = await hre.ethers.deployContract(VESTING_CONTRACT, [
            h.getAddress(CONTROL_TOWER_CONTRACT),
            "0xc9740aa94a8a02a3373f5f1b493d7e10d99ae811",
            "0x06FEB7a047e540B8d92620a2c13Ec96e1FF5E19b",
            h.getAddress(IBO_CONTRACT),
        ]);
        await vestingContract.waitForDeployment();
        h.writeFile(VESTING_CONTRACT, await vestingContract.getAddress(), DEPLOY_VESTING_CONTRACT);
        console.log("vesting deployed");
    }

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

    // Deploy CvgToken
    const DEPLOY_CVG_TOKEN = "DEPLOY_CVG_TOKEN";
    if (!h.getTrigger(DEPLOY_CVG_TOKEN)) {
        const cvgContract = await hre.ethers.deployContract(CVG_CONTRACT, [
            h.getAddress(CONTROL_TOWER_CONTRACT),
            await h.getContract(VESTING_CONTRACT),
            airdropMultisig,
        ]);
        await cvgContract.waitForDeployment();

        h.writeFile(CVG_CONTRACT, await cvgContract.getAddress(), DEPLOY_CVG_TOKEN);
        console.log("cvg deployed");
    }

    // Link Presale Wl Contract
    const SET_CVG_VESTING = "SET_CVG_VESTING";
    if (!h.getTrigger(SET_CVG_VESTING)) {
        const vestingContract = await h.getContract(VESTING_CONTRACT);

        await (await vestingContract.connect(treasuryDao).setCvg(h.getAddress("Cvg"))).wait();
        h.writeFile(null, null, SET_CVG_VESTING);
        console.log("set cvg vesting");
    }

    const seedPresaleContract = await h.getContract(PRESALE_SEED_CONTRACT);
    const wlPresaleContract = await h.getContract("WlPresaleCvg");
    const vestingCvgContract = await h.getContract(VESTING_CONTRACT);
    const iboContract = await h.getContract(IBO_CONTRACT);

    // finish presale rounds
    const FINISH_PRESALE_ROUND = "FINISH_PRESALE_ROUND";
    if (!h.getTrigger(FINISH_PRESALE_ROUND)) {
        const multisigMainnet = "0xfc15A25457A07fDb8fA226ec755164d04878392b";
        const cvgDeployer = "0xF3dfc28f42F512B9C7426F618bcff0b9B4E16d7A";
        await owner.sendTransaction({
            to: cvgDeployer,
            value: "1000000000000000000", // Sends exactly 10 ether
        });
        console.log("eth sent to cvgDeployer");
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [multisigMainnet],
        });

        await seedPresaleContract.connect(await ethers.getSigner(multisigMainnet)).setSaleState(3);
        await hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [multisigMainnet],
        });
        console.log("Seed finished");
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [cvgDeployer],
        });
        await wlPresaleContract.connect(await ethers.getSigner(cvgDeployer)).setSaleState(2);
        await hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [cvgDeployer],
        });
        console.log("Wl finished");
        h.writeFile(null, null, FINISH_PRESALE_ROUND);
        console.log("presale round finished");
    }
    // get SeedPresale & WlPresale Nft for user2
    const SEND_PRESALE_NFTS = "SEND_PRESALE_NFTS";
    if (!h.getTrigger(SEND_PRESALE_NFTS)) {
        const investorWallet = "0xe2853983A077B3e76A0876f4D6426B985F587eF4";
        await owner.sendTransaction({
            to: investorWallet,
            value: "1000000000000000000", // Sends exactly 10 ether
        });
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [investorWallet],
        });

        //Send SeedPresale NFT to user2
        await seedPresaleContract.connect(await ethers.getSigner(investorWallet)).transferFrom(investorWallet, user2.address, 29);
        //Send WlPresale NFT to user2
        await wlPresaleContract.connect(await ethers.getSigner(investorWallet)).transferFrom(investorWallet, user2.address, 49);

        await hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [investorWallet],
        });

        h.writeFile(null, null, SEND_PRESALE_NFTS);
        console.log("presale nfts sent to user2");
    }
    // Create Vesting Schedule SEED
    const CREATE_VESTING_SCHEDULE_SEED = "CREATE_VESTING_SCHEDULE_SEED";
    if (!h.getTrigger(CREATE_VESTING_SCHEDULE_SEED)) {
        const vestingContract = await h.getContract(VESTING_CONTRACT);
        await (
            await vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    ethers.parseUnits(REAL_VESTING_SCHEDULES.PRESEED_SEED.totalCvgAmount.toString(), 18),
                    (await time.latest()) + 5,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.type,
                    REAL_VESTING_SCHEDULES.PRESEED_SEED.dropCliff
                )
        ).wait();
        h.writeFile(null, null, CREATE_VESTING_SCHEDULE_SEED);
        console.log("Vesting schedule Seed created");
    }

    // Create Vesting Schedule WL
    const CREATE_VESTING_SCHEDULE_WL = "CREATE_VESTING_SCHEDULE_WL";
    if (!h.getTrigger(CREATE_VESTING_SCHEDULE_WL)) {
        const vestingContract = await h.getContract(VESTING_CONTRACT);
        await (
            await vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    ethers.parseUnits(REAL_VESTING_SCHEDULES.WL.totalCvgAmount.toString(), 18),
                    (await time.latest()) + 5,
                    REAL_VESTING_SCHEDULES.WL.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.WL.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.WL.type,
                    REAL_VESTING_SCHEDULES.WL.dropCliff
                )
        ).wait();
        h.writeFile(null, null, CREATE_VESTING_SCHEDULE_WL);
        console.log("Vesting schedule WL created");
    }

    // Create Vesting Schedule IBO
    const CREATE_VESTING_SCHEDULE_IBO = "CREATE_VESTING_SCHEDULE_IBO";
    if (!h.getTrigger(CREATE_VESTING_SCHEDULE_IBO)) {
        const vestingContract = await h.getContract(VESTING_CONTRACT);
        await (
            await vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    ethers.parseUnits(REAL_VESTING_SCHEDULES.IBO.totalCvgAmount.toString(), 18),
                    (await time.latest()) + 5,
                    REAL_VESTING_SCHEDULES.IBO.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.IBO.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.IBO.type,
                    REAL_VESTING_SCHEDULES.IBO.dropCliff
                )
        ).wait();
        h.writeFile(null, null, CREATE_VESTING_SCHEDULE_IBO);
        console.log("Vesting schedule IBO created");
    }

    // Create Vesting Schedule TEAM
    const CREATE_VESTING_SCHEDULE_TEAM = "CREATE_VESTING_SCHEDULE_TEAM";
    if (!h.getTrigger(CREATE_VESTING_SCHEDULE_TEAM)) {
        const vestingContract = await h.getContract(VESTING_CONTRACT);
        await (
            await vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    ethers.parseUnits(REAL_VESTING_SCHEDULES.TEAM.totalCvgAmount.toString(), 18),
                    (await time.latest()) + 5,
                    REAL_VESTING_SCHEDULES.TEAM.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.TEAM.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.TEAM.type,
                    REAL_VESTING_SCHEDULES.TEAM.dropCliff
                )
        ).wait();
        h.writeFile(null, null, CREATE_VESTING_SCHEDULE_TEAM);
        console.log("Vesting schedule TEAM created");
    }

    // Create Vesting Schedule DAO
    const CREATE_VESTING_SCHEDULE_DAO = "CREATE_VESTING_SCHEDULE_DAO";
    if (!h.getTrigger(CREATE_VESTING_SCHEDULE_DAO)) {
        const vestingContract = await h.getContract(VESTING_CONTRACT);
        await (
            await vestingContract
                .connect(treasuryDao)
                .createVestingSchedule(
                    ethers.parseUnits(REAL_VESTING_SCHEDULES.DAO.totalCvgAmount.toString(), 18),
                    (await time.latest()) + 5,
                    REAL_VESTING_SCHEDULES.DAO.daysBeforeCliff,
                    REAL_VESTING_SCHEDULES.DAO.daysAfterCliff,
                    REAL_VESTING_SCHEDULES.DAO.type,
                    REAL_VESTING_SCHEDULES.DAO.dropCliff
                )
        ).wait();
        h.writeFile(null, null, CREATE_VESTING_SCHEDULE_DAO);
        console.log("Vesting schedule DAO created");
    }

    //verify contracts if ethernal
    if (hre.network.name == "cvg") {
        await protocolDeployers.verifyContracts();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
