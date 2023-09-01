const {BigNumber} = require("ethers");

const routerUniV3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const abiRouter = require("../../abis/UniswapRouterV3.json");
const contracts = require("../../scripts/deployer/complete/contract-registry.json");

task("swap-uni3", "Swap a UNI", async function (taskArguments, hre, runSuper) {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    const poolTicker = taskArguments["pool"];
    let amountIn = taskArguments["amount"];
    const direction = taskArguments["direction"];

    let addresses = JSON.parse(contracts);

    await hre.run("prices", {pool: poolTicker});

    const poolAddress = addresses.v3PoolContracts[poolTicker];
    const poolContract = await ethers.getContractAt("IUniswapV3Pool", poolAddress);

    const token0 = await ethers.getContractAt("ERC20", await poolContract.token0());
    const token1 = await ethers.getContractAt("ERC20", await poolContract.token1());

    const path = direction == "1" ? [token0, token1] : [token1, token0];

    amountIn = BigNumber.from(amountIn.toString()).mul(BigNumber.from(Math.pow(10, Number(await path[1].decimals())).toString()));
    const router3Uniswap = await ethers.getContractAt(abiRouter, routerUniV3);

    direction == "1"
        ? await token0.connect(owner).approve(routerUniV3, ethers.MAX_INTEGER)
        : await token1.connect(owner).approve(routerUniV3, ethers.MAX_INTEGER);

    const inputParams = {
        tokenIn: path[0].address,
        tokenOut: path[1].address,
        fee: await poolContract.fee(),
        recipient: owner.address,
        deadline: Date.now() + 1000,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
    await (await router3Uniswap.exactInputSingle(inputParams)).wait();

    console.log("Swap executed");

    await hre.run("prices", {pool: poolTicker});
})
    .addParam("pool", "Pool ticker")
    .addParam("amount", "Amount in ")
    .addParam("direction", "Swap direction");
