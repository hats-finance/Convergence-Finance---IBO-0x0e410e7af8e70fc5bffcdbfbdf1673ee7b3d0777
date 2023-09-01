const hre = require("hardhat");

const {TOKENS} = require("../../config");
const giveTokensToAddresses = require("../../../utils/thiefv2");

const deployFakeAsset = async (contracts, users, amount) => {
    await giveTokensToAddresses(users.allUsers, [
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
    const erc20ArtifactName = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";

    const daiContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.DAI.address);
    const fraxContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.FRAX.address);
    const wethContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.WETH.address);
    const crvContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.CRV.address);
    const cvxContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.CVX.address);
    const cncContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.CNC.address);
    const fxsContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.FXS.address);
    const tokeContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.TOKE.address);
    const sdtContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.SDT.address);
    const fraxBpContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.FRAXBP.address);
    const usdcContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.USDC.address);
    const usdtContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.USDT.address);

    const tALCXContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tALCX.address);
    const tDAIContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tDAI.address);
    const tWETHContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tWETH.address);
    const tFOXContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tFOX.address);
    const tFRAXContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tFRAX.address);
    const tFXSContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tFXS.address);
    // const tGAMMAContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tGAMMA.address);
    // const tMYCContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tMYC.address);
    const tSNXContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tSNX.address);
    const tSUSHIContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tSUSHI.address);
    const tUSDCContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tUSDC.address);
    const tgOHMContract = await hre.ethers.getContractAt(erc20ArtifactName, TOKENS.tgOHM.address);

    let tokenContracts = {
        daiContract,
        fraxContract,
        wethContract,
        crvContract,
        cvxContract,
        cncContract,
        fxsContract,
        sdtContract,
        fraxBpContract,
        usdcContract,
        usdtContract,
        tokeContract,
    };

    //@dev changing
    let tAssetContracts = {
        tALCXContract,
        tDAIContract,
        tWETHContract,
        tFOXContract,
        tFRAXContract,
        tFXSContract,
        // tGAMMAContract,
        // tMYCContract,
        tgOHMContract,
        tSNXContract,
        tSUSHIContract,
        tUSDCContract,
    };

    return {...contracts, ...{tokenContracts, tAssetContracts}};
};

module.exports = deployFakeAsset;
