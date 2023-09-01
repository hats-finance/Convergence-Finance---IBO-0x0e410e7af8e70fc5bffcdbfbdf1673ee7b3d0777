const swapTaskV2 = require("./swaps/swap-v2");
const swapTaskV3 = require("./swaps/swap-v3");
const swapTaskCRV = require("./swaps/swap-curve");
const priceTask = require("./prices");
const timeTravel = require("./time-travel");
module.exports = {
    swapTaskV2,
    swapTaskV3,
    swapTaskCRV,
    priceTask,
    timeTravel,
};
