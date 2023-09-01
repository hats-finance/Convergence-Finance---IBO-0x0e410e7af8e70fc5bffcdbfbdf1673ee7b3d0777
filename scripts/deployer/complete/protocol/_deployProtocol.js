const protocolDeployers = require("./index");

async function main() {
    //deploy CVG Base
    await protocolDeployers.deployCvgBase();

    //deploy CLONE
    await protocolDeployers.deployClone();

    //deploy ORACLE
    await protocolDeployers.deployOracle();

    //deploy BOND
    await protocolDeployers.deployBond();

    //deploy PRESALE/VESTING
    await protocolDeployers.deployPresaleVesting();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
