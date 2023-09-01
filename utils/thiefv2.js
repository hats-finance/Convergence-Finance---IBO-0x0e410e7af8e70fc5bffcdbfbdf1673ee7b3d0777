const {setStorageAt} = require("@nomicfoundation/hardhat-network-helpers");
const GlobalHelper = require("./GlobalHelper");
const {toQuantity} = require("ethers");

// tokens used must be in the TOKEN config to be able to retrieve the slot of the balanceMapping
const giveTokensToAddresses = async (users, tokensAmounts) => {
    for (let i = 0; i < users.length; i++) {
        const userAddress = users[i].address;

        for (let j = 0; j < tokensAmounts.length; j++) {
            const tokenAmount = tokensAmounts[j];
            let storageSlot = "";
            if (tokenAmount.token.isVyper) {
                storageSlot = await GlobalHelper.calculateStorageSlotEthersVyper(userAddress, tokenAmount.token.slotBalance);
            } else {
                storageSlot = await GlobalHelper.calculateStorageSlotEthersSolidity(userAddress, tokenAmount.token.slotBalance);
            }
            await setStorageAt(tokenAmount.token.address, storageSlot, toQuantity(tokenAmount.amount));
        }
    }
};

module.exports = giveTokensToAddresses;
