const {zeroAddress} = require("@nomicfoundation/ethereumjs-util");
const GlobalHelper = require("../utils/GlobalHelper");
const TIMER_VERIFY_ETHERSCAN = 30;
/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                    TOKEN CONFIG
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

const TOKENS = {
    DAI: {
        name: "DAI",
        ticker: "DAI",
        decimals: 18,
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        bond_config: {
            maxCvgToMint: ethers.parseEther("420000"),
            minRoi: "10000",
            maxRoi: "55000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "432000",
            numberOfPeriod: "112",
            isStable: true,
            percentageMaxCvgToMint: 200,
            bondCycleDuration: 43_200,
            oracleParams: {
                poolAddress: zeroAddress(),
                poolType: "0",
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9",
                deltaAggregatorCvgOracle: 1000,
            },
        },
        slotBalance: 2,
    },
    FRAX: {
        name: "FRAX",
        ticker: "FRAX",
        decimals: 18,
        address: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
        bond_config: {
            maxCvgToMint: ethers.parseEther("420000"),
            minRoi: "10000",
            maxRoi: "55000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "432000",
            numberOfPeriod: "112",
            isStable: true,
            percentageMaxCvgToMint: 200,
            bondCycleDuration: 43_200,
            oracleParams: {
                poolAddress: zeroAddress(),
                poolType: "0",
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: "0xb9e1e3a9feff48998e45fa90847ed4d467e8bcfd",
                deltaAggregatorCvgOracle: 1000,
            },
        },
        slotBalance: 0,
    },
    WETH: {
        name: "wrapped Eth",
        ticker: "WETH",
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        bond_config: {
            maxCvgToMint: ethers.parseEther("250000"),
            minRoi: "10000",
            maxRoi: "75000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "518400",
            numberOfPeriod: "112",
            percentageMaxCvgToMint: 200,
            oracleParams: {
                poolAddress: "0xf5f5b97624542d72a9e06f04804bf81baa15e2b4",
                poolType: "3",
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: false,
        },
        slotBalance: 3,
    },
    CRV: {
        name: "Curve",
        ticker: "CRV",
        decimals: 18,
        address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
        bond_config: {
            maxCvgToMint: ethers.parseEther("240000"),
            minRoi: "15000",
            maxRoi: "80000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "604800",
            numberOfPeriod: "112",
            percentageMaxCvgToMint: 200,
            oracleParams: {
                poolAddress: "0x4ebdf703948ddcea3b11f675b4d1fba9d2414a14",
                poolType: "3",
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: false,
        },
        isVyper: true,
        slotBalance: 3,
    },
    CVX: {
        name: "Convex",
        ticker: "CVX",
        decimals: 18,
        address: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
        bond_config: {
            maxCvgToMint: ethers.parseEther("250000"),
            minRoi: "15000",
            maxRoi: "80000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "604800",
            numberOfPeriod: "112",
            percentageMaxCvgToMint: 200,
            bondCycleDuration: 43_200,
            oracleParams: {
                poolAddress: "0xb576491f1e6e5e62f1d8f26062ee822b40b0e0d4",
                poolType: "2",
                isReversed: false,
                isEthPriceRelated: true,
                aggregatorOracle: "0xd962fC30A72A84cE50161031391756Bf2876Af5D",
                deltaAggregatorCvgOracle: 2000,
            },
            isStable: false,
        },
        slotBalance: 0,
    },
    FXS: {
        name: "Frax Share",
        ticker: "FXS",
        decimals: 18,
        address: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
        bond_config: {
            maxCvgToMint: ethers.parseEther("200000"),
            minRoi: "15000",
            maxRoi: "80000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "604800",
            numberOfPeriod: "112",
            percentageMaxCvgToMint: 200,
            bondCycleDuration: 43_200,
            oracleParams: {
                poolAddress: "0x03B59Bd1c8B9F6C265bA0c3421923B93f15036Fa",
                poolType: "1",
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: "0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: false,
        },
        slotBalance: 0,
    },
    TOKE: {
        name: "Tokemak",
        ticker: "TOKE",
        decimals: 18,
        address: "0x2e9d63788249371f1DFC918a52f8d799F4a38C94",
        bond_config: {
            maxCvgToMint: ethers.parseEther("160000"),
            minRoi: "15000",
            maxRoi: "80000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "604800",
            percentageMaxCvgToMint: 200,
            oracleParams: {
                poolAddress: "0xd4e7a6e2d03e4e48dfc27dd3f46df1c176647e38",
                poolType: "1",
                isReversed: true,
                isEthPriceRelated: true,
                aggregatorOracle: "0x104cD02b2f22972E8d8542867a36bDeDA4f104d8",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: false,
        },
        aggregator_config: {
            description: "Toke PriceFeed",
        },
        slotBalance: 0,
    },
    SDT: {
        name: "Stake DAO",
        ticker: "SDT",
        decimals: 18,
        address: "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F",
        bond_config: {
            maxCvgToMint: ethers.parseEther("120000"),
            minRoi: "15000",
            maxRoi: "80000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "604800",
            percentageMaxCvgToMint: 200,
            oracleParams: {
                poolAddress: "0xfb8814d005c5f32874391e888da6eb2fe7a27902",
                poolType: "2",
                isReversed: false,
                isEthPriceRelated: true,
                aggregatorOracle: "0x0000000000000000000000000000000000000000",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: false,
        },
        aggregator_config: {
            description: "Toke PriceFeed",
        },
        slotBalance: 0,
    },
    CNC: {
        name: "Conic Finance",
        ticker: "CNC",
        decimals: 18,
        address: "0x9aE380F0272E2162340a5bB646c354271c0F5cFC",
        bond_config: {
            maxCvgToMint: ethers.parseEther("120000"),
            minRoi: "15000",
            maxRoi: "80000",
            gamma: 250000n,
            scale: 5000n,
            composedFunction: "0",
            vestingTerm: "604800",
            numberOfPeriod: "112",
            percentageMaxCvgToMint: 200,
            bondCycleDuration: 43_200,
            oracleParams: {
                poolAddress: "0x838af967537350d2c44abb8c010e49e32673ab94",
                poolType: "2",
                isReversed: false,
                isEthPriceRelated: true,
                aggregatorOracle: "0x0000000000000000000000000000000000000000",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: false,
        },
        aggregator_config: {
            description: "Toke PriceFeed",
        },
        slotBalance: 0,
    },
    USDC: {
        name: "USDC",
        ticker: "USDC",
        decimals: 6,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        slotBalance: 9,
        bond_config: {
            maxCvgToMint: ethers.parseEther("200000"),
            minRoi: "15000",
            maxRoi: "80000",
            composedFunction: "0",
            vestingTerm: "604800",
            numberOfPeriod: "112",
            percentageMaxCvgToMint: 200,
            oracleParams: {
                poolAddress: "0x0000000000000000000000000000000000000000",
                poolType: "0",
                isReversed: false,
                isEthPriceRelated: false,
                aggregatorOracle: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
                deltaAggregatorCvgOracle: 1000,
            },
            isStable: true,
        },
    },
    USDT: {
        name: "USDT",
        ticker: "USDT",
        decimals: 6,
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        slotBalance: 2,
    },
    FRAXBP: {
        name: "FRAXBP",
        ticker: "FRAXBP",
        address: "0x3175df0976dfa876431c2e9ee6bc45b65d3473cc",
        decimals: 18,
        isVyper: true,
        slotBalance: 7,
    },
    sdFRAX3CRV: {
        name: "sdFRAX3CRV",
        ticker: "sdFRAX3CRV",
        decimals: 18,
        slotBalance: 0,
        address: "0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7",
    },
    tALCX: {
        name: "tALCX",
        ticker: "tALCX",
        decimals: 18,
        slotBalance: 51,
        address: "0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84",
    },
    tDAI: {
        name: "tDAI",
        ticker: "tDAI",
        decimals: 18,
        slotBalance: 51,
        address: "0x0ce34f4c26ba69158bc2eb8bf513221e44fdfb75",
    },
    tWETH: {
        name: "tWETH",
        ticker: "tWETH",
        decimals: 18,
        slotBalance: 51,
        address: "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36",
    },
    tFOX: {
        name: "tFOX",
        ticker: "tFOX",
        decimals: 18,
        slotBalance: 51,
        address: "0x808D3E6b23516967ceAE4f17a5F9038383ED5311",
    },
    tFRAX: {
        name: "tFRAX",
        ticker: "tFRAX",
        decimals: 18,
        slotBalance: 51,
        address: "0x94671a3cee8c7a12ea72602978d1bb84e920efb2",
    },
    tFXS: {
        name: "tFXS",
        ticker: "tFXS",
        decimals: 18,
        slotBalance: 51,
        address: "0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655",
    },
    tSNX: {
        name: "tSNX",
        ticker: "tSNX",
        decimals: 18,
        slotBalance: 51,
        address: "0xeff721Eae19885e17f5B80187d6527aad3fFc8DE",
    },
    tSUSHI: {
        name: "tSUSHI",
        ticker: "tSUSHI",
        decimals: 18,
        slotBalance: 51,
        address: "0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777",
    },
    tgOHM: {
        name: "tgOHM",
        ticker: "tgOHM",
        decimals: 18,
        slotBalance: 51,
        address: "0x41f6a95Bacf9bC43704c4A4902BA5473A8B00263",
    },

    // tMYC: {
    //     name: "tMYC",
    //     ticker: "tMYC",
    //     decimals: 18,
    //     slotBalance: 51,
    //     address: "0x04bDA0CF6Ad025948Af830E75228ED420b0e860d",
    // },
    // tGAMMA: {
    //     name: "tGAMMA",
    //     ticker: "tGAMMA",
    //     decimals: 18,
    //     slotBalance: 51,
    //     address: "0xDc0b02849Bb8E0F126a216A2840275Da829709B0",
    // },
    tUSDC: {
        name: "tUSDC",
        ticker: "tUSDC",
        decimals: 6,
        slotBalance: 51,
        address: "0x04bDA0CF6Ad025948Af830E75228ED420b0e860d",
    },
};

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                    V3 POOL CONFIG           sqrtRatioX96 ** 2 / 2 ** 192 = price
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

const V3_POOLS = {
    USDC_ETH_V3: {
        fee: 100,
        price: 0,
        tickLower: -887220,
        tickUpper: 887220,
        amount0Desired: ethers.parseUnits("700000000", 6),
        amount1Desired: ethers.parseEther("190000"),
        amount0Min: 0,
        amount1Min: 0,
    },
    BTC_ETH_V3: {
        fee: 100,
        price: 0,
        tickLower: -887220,
        tickUpper: 887220,
        amount0Desired: ethers.parseUnits("3353", 8),
        amount1Desired: ethers.parseEther("43589"),
        amount0Min: 0,
        amount1Min: 0,
    },
    CRV_ETH_V3: {
        fee: 100,
        price: 0,
        tickLower: -887220,
        tickUpper: 887220,
        amount0Desired: ethers.parseEther("2192000"),
        amount1Desired: ethers.parseEther("1600"),
        amount0Min: 0,
        amount1Min: 0,
    },
    CVX_ETH_V3: {
        fee: 100,
        price: 0,
        tickLower: -887220,
        tickUpper: 887220,
        amount0Desired: ethers.parseEther("131000"),
        amount1Desired: ethers.parseEther("1224"),
        amount0Min: 0,
        amount1Min: 0,
    },
};

/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                    V2 POOL CONFIG
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

const V2_POOLS = {
    TOKE_ETH: {
        amountADesired: ethers.parseEther("2604258"),
        amountBDesired: ethers.parseEther("19302"),
        amountAMin: ethers.parseEther("2604258"),
        amountBMin: ethers.parseEther("19302"),
        price: 0,
    },
    FRAX_FXS: {
        amountADesired: ethers.parseEther("15000000"),
        amountBDesired: ethers.parseEther("3000000"),
        amountAMin: ethers.parseEther("17000"),
        amountBMin: ethers.parseEther("456"),
        price: 0,
    },
};

const AGGREGATOR_CONFIGS = {
    CVG: {
        decimals: 18,
        description: "Cvg PriceFeeed",
    },
    TOKE: {
        decimals: 18,
        description: "Toke PriceFeed",
    },
    CNC: {
        decimals: 18,
        description: "Cnc PriceFeed",
    },
    STD: {
        decimals: 18,
        description: "Stake DAO PriceFeed",
    },
};

const TOTAL_CVG_TO_SOLD_IBO = 1_500_000;

const REAL_VESTING_SCHEDULES = {
    PRESEED_SEED: {
        totalCvgAmount: 8_800_000,
        daysBeforeCliff: 4 * 30,
        daysAfterCliff: 15 * 30,
        dropCliff: 50,
        type: 1,
    },
    WL: {
        totalCvgAmount: 2_450_000,
        daysBeforeCliff: 0,
        daysAfterCliff: 3 * 30,
        dropCliff: 330,
        type: 2,
    },
    IBO: {
        totalCvgAmount: TOTAL_CVG_TO_SOLD_IBO,
        daysBeforeCliff: 0,
        daysAfterCliff: 2 * 30,
        dropCliff: 0,
        type: 3,
    },
    TEAM: {
        totalCvgAmount: 12_750_000,
        daysBeforeCliff: 180,
        daysAfterCliff: 18 * 30,
        dropCliff: 50,
        type: 4,
    },
    DAO: {
        totalCvgAmount: 15_000_000,
        daysBeforeCliff: 0,
        daysAfterCliff: 18 * 30,
        dropCliff: 50,
        type: 5,
    },
};
const REAL_IBO_PARAMETERS = {
    FRAX: {
        BOND_PARAMETERS: {
            composedFunction: 0,
            token: TOKENS.FRAX.address,
            gamma: 250_000, // 0.25%
            scale: 5_000, // 0.5%
            minRoi: 140_000, // 14%
            maxRoi: 200_000, // 20%
            percentageMaxCvgToMint: 40,
            maxCvgToMint: ethers.parseEther((TOTAL_CVG_TO_SOLD_IBO * 0.25).toString()),
        },
    },
    CRV: {
        BOND_PARAMETERS: {
            composedFunction: 0,
            token: TOKENS.CRV.address,
            gamma: 250_000, // 0.25%
            scale: 5_000, // 0.5%
            minRoi: 140_000, // 14%
            maxRoi: 200_000, // 20%
            percentageMaxCvgToMint: 20,
            maxCvgToMint: ethers.parseEther((TOTAL_CVG_TO_SOLD_IBO * 0.5).toString()),
        },
    },
    CVX: {
        BOND_PARAMETERS: {
            composedFunction: 0,
            token: TOKENS.CVX.address,
            gamma: 250_000, // 0.25%
            scale: 5_000, // 0.5%
            minRoi: 140_000, // 14%
            maxRoi: 200_000, // 20%
            percentageMaxCvgToMint: 40,
            maxCvgToMint: ethers.parseEther((TOTAL_CVG_TO_SOLD_IBO * 0.25).toString()),
        },
    },
};

module.exports = {
    TOKENS,
    V2_POOLS,
    V3_POOLS,
    AGGREGATOR_CONFIGS,
    REAL_VESTING_SCHEDULES,
    TIMER_VERIFY_ETHERSCAN,
    REAL_IBO_PARAMETERS,
};
