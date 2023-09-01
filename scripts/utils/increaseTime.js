const fs = require("fs");
const config = require("../config.json");
const {time} = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    let config_time = config;
    if (config_time["day"]) {
        config_time["day"];
    } else {
        config_time["day"] = 0;
    }
    console.log(`${config_time["day"]} actual day`);
    // const daysToIncrease = process.env.INCREASE_TIME_DAYS;
    const daysToIncrease = 135;
    config_time["day"] += daysToIncrease;

    await time.increase(daysToIncrease * 86400);
    console.log(`${config_time["day"]} updated day`);

    const writeStream = fs.createWriteStream("./scripts/config.json");
    writeStream.write(JSON.stringify(config_time, null, 4));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
