# After a bond deployment ...

**Available for LP deployed by the FakeliquidityDeployer**

- Each of these addresses are stored in a .json file
- **Erased** at each deployment of Bonds

## Print bonds

Print all bond contracts in raw format

```
npx hardhat prices (--pool {poolName}) --network {networkName}
```

## Check price of the assets

Print the price of all the assets in `last-contracts-deployed.json`

- pool : **_Optionnal_** filter only the price of the pool in parameter

```
npx hardhat prices (--pool {poolName}) --network {networkName}
```

## Swap on a UniV2 Pool

Performs a swap on a UniswapV2 pool like

- amount : tokenAmountIn, decimals conversion is already taken into account
- pool : pool ticker, must be in under `V2_POOLS` in `last-contracts-deployed.json` file
- direction : 1 or 0, in order to change the token

ex :

```
npx hardhat swap-uni2 --amount 10000000 --pool TOKE_ETH_V2 --direction 0 --network localhost
```

## Swap on a UniV3 Pool

- amount : tokenAmountIn, decimals conversion is already taken into account
- pool : pool ticker, must be in under `V3_POOLS` in `last-contracts-deployed.json` file
- direction : 1 or 0, in order to change the token

ex :

```
npx hardhat swap-uni3 --amount 10000000 --pool USDC_ETH_V3 --direction 0 --network localhost
```

## Swap on a Curve Pool

- amount : tokenAmountIn, decimals conversion is already taken into account
- pool : pool ticker, must be in under `V3_POOLS` in `last-contracts-deployed.json` file
- direction : 1 or 0, in order to change the token

ex :

```
npx hardhat swap-curve --amount 1 --pool CRV_ETH_CURVE --direction 1 --network localhost
```
