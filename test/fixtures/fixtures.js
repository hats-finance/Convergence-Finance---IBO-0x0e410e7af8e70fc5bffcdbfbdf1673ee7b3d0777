const TestHelper = require("../TestHelper");

function deployBondCalculatorFixture() {
    const testHelper = new TestHelper();
    return testHelper.deployBondCalculator();
}

function deployPresaleVestingFixture() {
    const testHelper = new TestHelper();
    return testHelper.deployPresaleVesting();
}

function deployOracleFixture() {
    const testHelper = new TestHelper();
    return testHelper.deployOracle();
}

function deployIboFixture() {
    const testHelper = new TestHelper();
    return testHelper.deployIbo();
}

module.exports = {
    deployBondCalculatorFixture,
    deployPresaleVestingFixture,
    deployOracleFixture,
    deployIboFixture,
};
