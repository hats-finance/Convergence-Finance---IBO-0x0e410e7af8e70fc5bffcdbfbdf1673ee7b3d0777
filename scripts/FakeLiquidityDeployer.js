const GlobalHelper = require("../utils/GlobalHelper");
const {MAX_INTEGER} = require("@nomicfoundation/ethereumjs-util");

class FakeLiquidityDeployer extends GlobalHelper {
    deployCvgLiquidity = async (contracts) => {
        const tokenContracts = contracts.tokenContracts;

        const cvgContract = contracts.cvgContract;
        const fraxBpContract = tokenContracts.fraxBpContract; // Use DAI instead of creating a new fraxBpToken for nothing

        const poolParams = {
            name: "CVG/FRAXBP",
            symbol: "CVGFRAXBP",
            coin0: fraxBpContract,
            coin1: cvgContract,
            price: BigInt("390000000000000000"), // 0.39 $
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

        await cvgPoolContract.add_liquidity([amountStable, amountCvg], "0");
        return {...contracts, ...{cvgPoolContract}};
    };
}

module.exports = FakeLiquidityDeployer;
