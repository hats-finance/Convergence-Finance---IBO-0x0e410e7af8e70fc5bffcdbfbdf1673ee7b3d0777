# Audit Competition for Convergence-Finance---IBO
This repository is for the audit competition for the Convergence-Finance---IBO.
To participate, submit your findings only by using the on-chain submission process on https://app.hats.finance/vulnerability .
## How to participate
- follow the instructions on https://app.hats.finance/
## Good luck!
We look forward to seeing your findings.
* * *
# Audit contest Hats 1 - Convergence

# Repo archi

- **contracts** : Convergence Protocol

  - **interfaces** : Smart Contract interfaces
  - **mock** : Mocked contracts, ONLY FOR TESTING PURPOSE
  - Any other folder sorts contracts per feature

- **docs** : Generated doc by _hardhat-docgen_
- **scripts** : Deployment & utility scripts interacting with contracts \*\*DeployHelper.js\*\* containing the deployment script context
- **tasks** : Hardhat tasks
- **technical-docs** : Sequential diagrams & Description of complex functions
- **test** : Unit & Integration testing. **TestHelper** containing the deployment script context
- **utils** : Utility classes & functions

# To run the project

To install dependencies

```shell
npm i
```

# To run a local network forking the mainnet :

```shell
npm run mainnet-forking
```

# Test

Unit testing are located in `test` folder.
To run the full test :

```
npm run test
```

Single test:

```shell
npm run test --grep path/to/file
```

Entire folder:

```shell
npm run test --grep path/to/folder/**
```
