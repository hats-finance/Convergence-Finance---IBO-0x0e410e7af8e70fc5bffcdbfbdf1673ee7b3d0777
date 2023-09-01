# Protocol ERC20

## Description

there is different types of Erc20 used in the protocol:

- Cvg
- CvgToke

## Cvg

### Description

The main protocol token , used to reflect the value of the protocol.
A liquidity pool will be created on curve to allow the token to be traded.

Involved Contracts :

- contracts/Token/Cvg.sol
- contracts/CvgControlTower.sol

### remarkable functionnality

| method        | description                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `mintAirdrop` | Allow the airdrop contract to mint CVG accordingly ` MAX_SUPPLY_AIRDROP`                                              |
| `burn`        | the burn method is overloaded compared to the openzepelin standard, the total supply is diminished by the burn amount |
