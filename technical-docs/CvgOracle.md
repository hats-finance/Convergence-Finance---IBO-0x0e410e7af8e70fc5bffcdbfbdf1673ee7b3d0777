# CvgOracle

## Description

This contract allows to compute prices of the assets proposed through the Bond program in USD$.

`CvgOracle` contract ensures that asset price found in Liquid Pool is not too distant from the aggregatorOracle price.

To check that, this contract will retrieve the current price based on the pool type\* (Univ2 or Univ3, or Curve) and then compare that to the latest aggregatorOracle price with a delta parameter (in %) set by the team.
This kind of check will secure the protocol from possible arbitrary liquidity attacks.

## Get V2 Price

```mermaid
sequenceDiagram
    Internal->>+CvgOracle: _getV2Price
    CvgOracle-->>+IUniswapV2Pair: getReserves
    CvgOracle->>CvgOracle: getDecimalsDelta
    CvgOracle->>CvgOracle: postTreatmentAndVerifyEth
```

## Get V3 Price

```mermaid
sequenceDiagram
    Internal->>+CvgOracle: _getV3Price
    alt twapInterval == 0
    CvgOracle-->>+IUniswapV3Pool: slot0
    else
    CvgOracle-->>+IUniswapV3Pool: observe
    end
    CvgOracle->>CvgOracle: getDecimalsDelta
    CvgOracle->>CvgOracle: postTreatmentAndVerifyEth
```

## Get CrvPool Price

```mermaid
sequenceDiagram
    Internal->>+CvgOracle: _getCrvPoolPrice
    CvgOracle-->>+ICrvPool: last_prices
    CvgOracle->>CvgOracle: postTreatmentAndVerifyEth
```

## Get CrvTriPool Price

```mermaid
sequenceDiagram
    Internal->>+CvgOracle: _getCrvPoolTricrypto
    CvgOracle-->>+ICrvPool: last_prices
    CvgOracle->>CvgOracle: postTreatmentAndVerifyEth
```

## Get Price Oracle

```mermaid
sequenceDiagram
    Internal->>+CvgOracle: getPriceOracle
    alt Pool V3 type
        CvgOracle->>CvgOracle: _getV3Price
    else Pool V2 type
        CvgOracle->>CvgOracle: _getV2Price
    else Pool Curve type
        CvgOracle->>CvgOracle: _getCrvPoolPrice
    else TriPool Curve type
        CvgOracle->>CvgOracle: _getCrvPoolTricrypto
    end
```

### Verify Price

```mermaid
sequenceDiagram
    User/Contract->>+CvgOracle: getAndVerifyPrice
    CvgOracle->>CvgOracle: getPriceOracle for given oracleParams
    CvgOracle->>CvgOracle: getPriceAggregator for given oracleParams
    CvgOracle->>CvgOracle: compute delta
    CvgOracle->>CvgOracle: return price and bool is price not too far
```

### Post Treatment and Verify Eth

This function allows to align all prices computed by the Oracle to 18 decimals, whatever the number of decimals of the token and the way Uniswap or Curve compute the price. Also, if the price computation passes through a pool that involves ETH and not a stablecoin, we return a boolean that is the result of the price verification between CvgOracle & ChainlinkAggregator.

```mermaid
sequenceDiagram
    Contract-->>+CvgOracle: postTreatmentAndVerifyEth
    alt isReversed
        CvgOracle-->>CvgOracle: reverse the price
    end
    alt isEthPriceRelated
        CvgOracle-->>CvgOracle: getAndVerifyPrice with ETH
        CvgOracle-->>CvgOracle: price is multiplied by ethPrice
    end
    CvgOracle-->>CvgOracle: return price & isEthVerified
```