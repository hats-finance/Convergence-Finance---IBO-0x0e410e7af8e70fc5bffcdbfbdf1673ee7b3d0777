const fs = require("fs");
const registryPath = "./scripts/deployer/complete/contract-registry.json";

function cleanFile() {
    const json = {
        addresses: {},
        triggers: {},
    };
    fs.writeFileSync(registryPath, JSON.stringify(json, null, 4));
}

cleanFile();
