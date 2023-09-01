const {time} = require("@nomicfoundation/hardhat-network-helpers");

task("timeTravel", "Travel", async function (taskArguments, _, _) {
    await time.increase(taskArguments["days"] * 60);
}).addOptionalParam("days", "Number of days to time travel");
