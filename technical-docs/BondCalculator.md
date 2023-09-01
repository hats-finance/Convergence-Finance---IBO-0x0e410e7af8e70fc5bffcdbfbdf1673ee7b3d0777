# BondCalculator

This contract allows to compute the discount of a bond. This computation is done on the fly of a deposit. Which means that the ROI of the bond is adjusted automatically. It uses the `ABDKMathQuad` library to preserve precision when math operation with a floating number happens and specific functions are needed such as **ln**.

To keep it simple:

- The closer we get to the end duration of the bond, the higher the ROI will be
- The closer we get to the sold target, the lower the ROI will be.

## Compute ROI Bond

The `BondCalculator` contract aims to compute the proper ROI (Return Of Investment) of a bond.
ROI changes according to :

- The time _t_ passed since the creation of the bond, compared to the end of the bond _T_
- Distributed CVG _Ntr_
- Max CVG to be distributed _maxDistr_
- The composed function type _func_ (sqrt, ln, square or linear)
- The _minRoi_ & _maxRoi_ configured

$Ntc = func(t/T) * maxCapacity$

$Ratio = ( Ntr / Ntc ) / Gamma$

$ROI = maxROI - ratio * scale$

### Compute Time Ratio Uint

```mermaid
sequenceDiagram
    Contract->>+BondCalculator: computeTimeRatioUInt
    BondCalculator-->>BondCalculator : computeTimeRatio
    BondCalculator-->>+ABDKMathQuad : toUint(fromUint(timeSpentSinceTheBeginningOfTheBond/totalDurationOfTheBond))
```

### Compute Cvg Expected

```mermaid
sequenceDiagram
    Internal->>+BondCalculator: computeCvgExpected
    BondCalculator-->>BondCalculator : computeTimeRatio
    alt composedFunction == 0
    BondCalculator-->>+ABDKMathQuad: sqrt function for timeRatio
    else composedFunction == 1
    BondCalculator-->>+ABDKMathQuad: ln function for timeRatio
    else composedFunction == 2
    BondCalculator-->>+BondCalculator: square function for timeRatio
    else composedFunction > 2
    BondCalculator-->>+BondCalculator: timeRatio
    end
    BondCalculator-->>+ABDKMathQuad: fromUint(cvgExpected)
```

### Compute Cvg Expected Uint

```mermaid
sequenceDiagram
    Contract->>+BondCalculator: computeCvgExpectedUInt
    BondCalculator-->>+ABDKMathQuad : toUint(computeCvgExpected)
```

### Compute Ntr/Ntc

```mermaid
sequenceDiagram
    Contract->>+BondCalculator: computeNtrDivNtc
    note over BondCalculator: Check INVALID_TIME
    BondCalculator-->>BondCalculator : computeCvgExpected
    BondCalculator-->>+ABDKMathQuad : toUint(fromUint(cvgMintedOnActualRound)/cvgExpected)
```

### Compute ROI

```mermaid
sequenceDiagram
    Contract->>+BondCalculator: computeRoi
    BondCalculator-->>BondCalculator : computeNtrDivNtc
    alt scale * NtrDivNtc >= maxRoi - minRoi
    BondCalculator-->>BondCalculator : minRoi
    else
    BondCalculator-->>BondCalculator : maxRoi - scale * NtrDivNtc
    end
```