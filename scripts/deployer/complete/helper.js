const fs = require("fs");
const {ethers} = require("hardhat");

const registryPath = "./scripts/deployer/complete/contract-registry.json";

const getContract = async (contractName) => {
    return await ethers.getContractAt(contractName, getAddress(contractName));
};
const getAddress = (contractName) => {
    return JSON.parse(fs.readFileSync(registryPath))["addresses"][contractName];
};
const getTrigger = (triggerName) => {
    return JSON.parse(fs.readFileSync(registryPath))["triggers"][triggerName];
};
const writeFile = (contractName, address, triggerName) => {
    const json = JSON.parse(fs.readFileSync(registryPath));
    if (address != null) {
        json["addresses"][contractName] = address;
    }
    if (triggerName != null) {
        json["triggers"][triggerName] = true;
    }
    fs.writeFileSync(registryPath, JSON.stringify(json, null, 4));
};

const writeBlockStart = (blockId) => {
    const json = JSON.parse(fs.readFileSync(registryPath));
    json["blockId"] = blockId;
    fs.writeFileSync(registryPath, JSON.stringify(json, null, 4));
};

const getAggregator = (aggregatorName) => {
    return JSON.parse(fs.readFileSync(registryPath))["addresses"]["aggregatorContracts"][aggregatorName];
};

module.exports = {getContract, getAddress, getTrigger, writeFile, writeBlockStart, getAggregator};
