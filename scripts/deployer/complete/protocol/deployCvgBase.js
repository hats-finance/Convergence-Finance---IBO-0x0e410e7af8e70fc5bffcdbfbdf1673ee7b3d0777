const {TOKENS} = require("../../../config");
const h = require("../helper");
const GlobalHelper = require("../../../../utils/GlobalHelper");
const {MAX_INTEGER} = require("@nomicfoundation/ethereumjs-util");
const giveTokensToAddresses = require("../../../../utils/thiefv2");

const deployCvgBase = async () => {
    const users = await ethers.getSigners();
    const owner = users[0];
    const treasuryDao = users[13];
    const treasuryStaking = users[14];
    const treasuryBonds = users[15];
    const aridropMultisig = users[17];
    // Contracts
    const PROXY_ADMIN = "ProxyAdmin";
    const CLONE_FACTORY_CONTRACT = "CloneFactory";
    const CONTROL_TOWER_CONTRACT = "CvgControlTower";
    const CVG_CONTRACT = "Cvg";
    const MOCK_ERC20 = "MockERC20";
    const usersToDistribute = [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9], users[10]];
    await giveTokensToAddresses(usersToDistribute, [
        {token: TOKENS.DAI, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.FRAX, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.WETH, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.TOKE, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.CRV, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.CVX, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.CNC, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.FXS, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.SDT, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.FRAXBP, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.USDC, amount: hre.ethers.parseUnits("100000000", 6)},
        {token: TOKENS.USDT, amount: hre.ethers.parseUnits("100000000", 6)},

        {token: TOKENS.tALCX, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.tDAI, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.tWETH, amount: hre.ethers.parseUnits("100000000")},
        {token: TOKENS.tFOX, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.tFRAX, amount: hre.ethers.parseEther("100000000")},
        {token: TOKENS.tFXS, amount: hre.ethers.parseEther("100000000")},
        // {token: TOKENS.tGAMMA, amount: hre.ethers.parseEther("100000000")},
        // {token: TOKENS.tMYC, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.tSNX, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.tSUSHI, amount: hre.ethers.parseEther("100000000")}, //
        {token: TOKENS.tUSDC, amount: hre.ethers.parseEther("100000000", 6)}, //
        {token: TOKENS.tgOHM, amount: hre.ethers.parseUnits("100000000")},
    ]);
    let tokenContracts = {
        DAI: TOKENS.DAI.address,
        FRAX: TOKENS.FRAX.address,
        WETH: TOKENS.WETH.address,
        TOKE: TOKENS.TOKE.address,
        CRV: TOKENS.CRV.address,
        CVX: TOKENS.CVX.address,
        CNC: TOKENS.CNC.address,
        FXS: TOKENS.FXS.address,
        SDT: TOKENS.SDT.address,
        FRAXBP: TOKENS.FRAXBP.address,
        USDC: TOKENS.USDC.address,
        USDT: TOKENS.USDT.address,
    };
    let tAssetContracts = {
        tALCX: TOKENS.tALCX.address,
        tDAI: TOKENS.tDAI.address,
        tWETH: TOKENS.tWETH.address,
        tFOX: TOKENS.tFOX.address,
        tFRAX: TOKENS.tFRAX.address,
        tFXS: TOKENS.tFXS.address,
        tSNX: TOKENS.tSNX.address,
        tSUSHI: TOKENS.tSUSHI.address,
        tUSDC: TOKENS.tUSDC.address,
        tgOHM: TOKENS.tgOHM.address,
    };

    h.writeFile("tokenContracts", tokenContracts, null);
    h.writeFile("tAssetContracts", tAssetContracts, null);

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

    // Deploy CloneFactory
    const DEPLOY_CLONE_FACTORY = "DEPLOY_CLONE_FACTORY";
    if (!h.getTrigger(DEPLOY_CLONE_FACTORY)) {
        //implementation
        const CloneFactoryImplementation = await ethers.getContractFactory(CLONE_FACTORY_CONTRACT);
        await upgrades.validateImplementation(CloneFactoryImplementation);

        const cloneFactoryImplementation = await hre.ethers.deployContract(CLONE_FACTORY_CONTRACT, []);
        await cloneFactoryImplementation.waitForDeployment();

        //proxy
        const abiCloneFactory = ["function initialize(address)"];
        const ifaceCloneFactory = new ethers.Interface(abiCloneFactory);
        const dataCloneFactory = ifaceCloneFactory.encodeFunctionData("initialize", [h.getAddress(CONTROL_TOWER_CONTRACT)]);

        const cloneFactoryProxy = await hre.ethers.deployContract("TransparentUpgradeableProxy", [
            await cloneFactoryImplementation.getAddress(),
            h.getAddress(PROXY_ADMIN),
            dataCloneFactory,
        ]);
        await cloneFactoryProxy.waitForDeployment();

        h.writeFile(CLONE_FACTORY_CONTRACT, await cloneFactoryProxy.getAddress(), DEPLOY_CLONE_FACTORY);
    }

    // Set the Clone Factory address in the ControlTower
    const SET_CLONE_FACTORY_IN_CONTROL_TOWER = "SET_CLONE_FACTORY_IN_CONTROL_TOWER";
    if (!h.getTrigger(SET_CLONE_FACTORY_IN_CONTROL_TOWER)) {
        const controlTowerContract = await h.getContract(CONTROL_TOWER_CONTRACT);
        await (await controlTowerContract.connect(treasuryDao).setCloneFactory(h.getAddress(CLONE_FACTORY_CONTRACT))).wait();
        h.writeFile(null, null, SET_CLONE_FACTORY_IN_CONTROL_TOWER);
        console.log("clone factory setted");
    }

    // Deploy CvgToken
    const DEPLOY_CVG_TOKEN = "DEPLOY_CVG_TOKEN";
    if (!h.getTrigger(DEPLOY_CVG_TOKEN)) {
        const cvgContract = await hre.ethers.deployContract(CVG_CONTRACT, [h.getAddress(CONTROL_TOWER_CONTRACT), owner, aridropMultisig]);
        await cvgContract.waitForDeployment();

        h.writeFile(CVG_CONTRACT, await cvgContract.getAddress(), DEPLOY_CVG_TOKEN);
        console.log("cvg deployed");
    }

    // Deploy CvgToken
    const MINT_CVG_TO_AIRDROP_MULTISIG = "MINT_CVG_TO_AIRDROP_MULTISIG";
    if (!h.getTrigger(MINT_CVG_TO_AIRDROP_MULTISIG)) {
        const cvgContract = await h.getContract(CVG_CONTRACT);
        await (await cvgContract.connect(aridropMultisig).mintAirdrop(aridropMultisig, await cvgContract.MAX_AIRDROP())).wait();
        h.writeFile(null, null, MINT_CVG_TO_AIRDROP_MULTISIG);
        console.log("cvg minted to airdrop multisig");
    }

    // Set the CVG token address in the ControlTower
    const SET_CVG_TOKEN_IN_CONTROL_TOWER = "SET_CVG_TOKEN_IN_CONTROL_TOWER";
    if (!h.getTrigger(SET_CVG_TOKEN_IN_CONTROL_TOWER)) {
        const controlTowerContract = await h.getContract(CONTROL_TOWER_CONTRACT);
        await (await controlTowerContract.connect(treasuryDao).setCvg(h.getAddress(CVG_CONTRACT))).wait();
        h.writeFile(null, null, SET_CVG_TOKEN_IN_CONTROL_TOWER);
        console.log("cvg setted");
    }
    const TRANSFER_CVG_TOKENS_USER = "TRANSFER_CVG_TOKENS_USER";
    if (!h.getTrigger(TRANSFER_CVG_TOKENS_USER)) {
        const amount = ethers.parseEther("20000");
        const cvgContract = await h.getContract(CVG_CONTRACT);
        for (let i = 1; i <= 12; i++) {
            let currentUser = users[i];
            await cvgContract.approve(currentUser, amount);
            await cvgContract.transfer(currentUser, amount);
        }
        h.writeFile(null, null, TRANSFER_CVG_TOKENS_USER);
        console.log("cvg token transfered to users");
    }

    //deploy cvg liquidity
    const DEPLOY_CVG_POOL = "DEPLOY_CVG_POOL";
    const CVG_POOL = "CVG_POOl";
    if (!h.getTrigger(DEPLOY_CVG_POOL)) {
        const fraxBpContract = await ethers.getContractAt(MOCK_ERC20, TOKENS.FRAXBP.address);
        const cvgContract = await h.getContract(CVG_CONTRACT);
        const poolParams = {
            name: "CVG/FRAXBP",
            symbol: "CVGFRAXBP",
            coin0: fraxBpContract,
            coin1: cvgContract,
            price: 330000000000000000n, // 0.33 $
        };
        const curveFactory = await hre.ethers.getContractAt("ICrvFactory", "0xF18056Bbd320E96A48e3Fbf8bC061322531aac99");
        const tx = await curveFactory.deploy_pool(
            poolParams.name,
            poolParams.symbol,
            [fraxBpContract, cvgContract],
            "400000", //A
            "145000000000000", //gamma
            "26000000", //mid_fee
            "45000000", //out_fee
            "2000000000000", //allowed_extra_profit
            "230000000000000", //fee_gamma
            "146000000000000", //adjustment_step
            "5000000000", //admin_fee
            "600", //ma_half_time
            poolParams.price //initial_price
        );
        await tx.wait();
        const poolAddress = await curveFactory.find_pool_for_coins(poolParams.coin0, poolParams.coin1, 0);
        const cvgPoolContract = await hre.ethers.getContractAt("ICrvPool", poolAddress);
        await (await poolParams.coin0.approve(poolAddress, MAX_INTEGER)).wait();
        await (await poolParams.coin1.approve(poolAddress, MAX_INTEGER)).wait();

        const amountStable = ethers.parseEther("100");
        const amountCvg = ethers.parseEther((amountStable / poolParams.price).toString());

        await (await cvgPoolContract.add_liquidity([amountStable, amountCvg], "0")).wait();

        h.writeFile(CVG_POOL, await cvgPoolContract.getAddress(), DEPLOY_CVG_POOL);
        console.log("cvg/fraxbp pool deployed and liquidity added");
    }
};

module.exports = deployCvgBase;
