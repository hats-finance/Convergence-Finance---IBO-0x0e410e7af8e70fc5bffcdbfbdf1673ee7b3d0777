const dotenv = require("dotenv");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-vyper");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-storage-layout");
require("hardhat-contract-sizer");
require("hardhat-docgen");

dotenv.config();

require("./tasks/index");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});
const PRIVKEY_DEFAULT = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

module.exports = {
    vyper: {
        compilers: [
            {
                version: "0.3.7",
            },
            {
                version: "0.2.16",
            },
        ],
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 250,
                    },
                },
            },
        ],
    },
    networks: {
        localhost: {
            chainId: 31337, // Chain ID should match the hardhat network's chainid
            forking: {
                url: `https://rpc.ankr.com/eth`,
            },
            loggingEnabled: true,
        },
        hardhat: {
            forking: {
                url: `https://rpc.ankr.com/eth`,
                // blockNumber: 17250000,
            },
        },
        goerli: {
            chainId: 5, // Chain ID should match the hardhat network's chainid
            url: "https://rpc.ankr.com/eth_goerli",
        },
        sepolia: {
            chainId: 11155111, // Chain ID should match the hardhat network's chainid
            url: "https://rpc.sepolia.org",
            gasPrice: 1000000000,
        },
        mainnet: {
            chainId: 1,
            url: "https://rpc.ankr.com/eth",
            accounts: [process.env.DEPLOYER_PRIVKEY ? process.env.DEPLOYER_PRIVKEY : PRIVKEY_DEFAULT],
        },
    },
    docgen: {
        path: "./docs",
        clear: true,
        runOnCompile: false,
        only: ["^contracts/"],
        except: ["contracts/mocks"],
    },
    mocha: {
        timeout: 100000000,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPrice: 150,
        outputFile: "./gasReporting.md",
        noColors: true,
        token: "ETH",
        gasPriceApi: process.env.ETHERSCAN_API_KEY,
        coinmarketcap: process.env.CMC_API,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};
