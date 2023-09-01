const hre = require("hardhat");

const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");
const {time} = require("@nomicfoundation/hardhat-network-helpers");

class GlobalHelper {
    _configureAccounts = async () => {
        const signers = await ethers.getSigners();
        const owner = signers[0];
        const user1 = signers[1];
        const user2 = signers[2];
        const user3 = signers[3];
        const user4 = signers[4];
        const user5 = signers[5];
        const user6 = signers[6];
        const user7 = signers[7];
        const user8 = signers[8];
        const user9 = signers[9];
        const user10 = signers[10];
        const user11 = signers[11];
        const user12 = signers[12];
        const treasuryDao = signers[13];
        const treasuryStaking = signers[14];
        const treasuryBonds = signers[15];
        const veSdtMultisig = signers[16];
        const airdropMultisig = signers[17];
        // Make users available for tests
        const currentUsers = this.users;

        const allUsers = [owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12];
        this.users = {
            currentUsers,
            ...{
                owner,
                user1,
                user2,
                user3,
                user4,
                user5,
                user6,
                user7,
                user8,
                user9,
                user10,
                user11,
                user12,
                treasuryDao,
                treasuryStaking,
                treasuryBonds,
                veSdtMultisig,
                airdropMultisig,
                allUsers,
            },
        };
    };

    static priceToBigNumber(number, decimals) {
        return ethers.parseUnits(number.toString(), decimals);
    }

    static convertEthersToNumber(bigNumber) {
        return Number(ethers.formatEther(bigNumber));
    }

    static getProofMerkle(arrayAddress, addressWallet) {
        const leafNodes = arrayAddress.map((addr) => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
        const claimingAddress = keccak256(addressWallet);
        return merkleTree.getHexProof(claimingAddress);
    }

    static getRoot = (arrayAddress) => {
        const leafNodes = arrayAddress.map((addr) => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
        const rootHash = merkleTree.getRoot();
        const hexString = rootHash.toString("hex");
        return "0x" + hexString;
    };

    static deployProxy = async (sigParams, params, interfaceString, adminAddress, isCheckValidate = true) => {
        if (isCheckValidate) {
            await upgrades.validateImplementation(await hre.ethers.getContractFactory(interfaceString));
        }
        const contractImplementation = await hre.ethers.deployContract(interfaceString, []);
        await contractImplementation.waitForDeployment();
        //proxy
        let data;

        if (params.length) {
            const abi = [`function initialize(${sigParams})`];
            const iface = new ethers.Interface(abi);
            data = iface.encodeFunctionData("initialize", params);
        } else {
            data = [];
        }
        const proxy = await hre.ethers.deployContract("TransparentUpgradeableProxy", [contractImplementation.getAddress(), adminAddress, data]);
        await proxy.waitForDeployment();

        return await ethers.getContractAt(interfaceString, proxy);
    };

    static async timeTraveller(daysNumber) {
        await time.increase(daysNumber * 86400);
    }

    static calculateStorageSlotEthersSolidity = async (addressKey, mappingSlot) => {
        const paddedAddress = ethers.zeroPadValue(addressKey, 32);
        const paddedSlot = ethers.zeroPadValue(ethers.toBeHex(mappingSlot), 32);
        const concatenated = ethers.concat([paddedAddress, paddedSlot]);
        const hash = ethers.keccak256(concatenated);
        return hash;
    };

    static calculateStorageSlotEthersVyper = async (addressKey, mappingSlot) => {
        const paddedSlot = ethers.zeroPadValue(ethers.toBeHex(mappingSlot), 32);
        const paddedAddress = ethers.zeroPadValue(addressKey, 32);
        const concatenated = ethers.concat([paddedSlot, paddedAddress]);
        const hash = ethers.keccak256(concatenated);
        return hash;
    };
}

module.exports = GlobalHelper;
