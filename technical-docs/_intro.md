# Audit scope

## Context

Convergence Finance is a Decentralized finance protocol with a governance accumulation narrative deeply involved in the `Curve` ecosystem.

One audit has already been performed by Halborn on the entierty of protocol [here](https://ipfs.io/ipfs/QmPyZZoeNJqt44GiFRoc8E9JctCyp5DYxkW254hhfkeUui)

We decided to don't audit the full protocol on this audit contest because of privacy and disclosure. So, some contracts such as `Cvg`, `CvgControlTower` and `CloneFactory` has been modified to be able to compile / run the tests.

## Motivations of the audit

The aim of the audit is to cover :

- The release of all vested $CVG though the `VestingCvg`
- The last fundraising round of Convergence `Ibo` which uses the same logic as the bonds we'll deploy once the protocol will be live.
- The computation of the bond ROI through the `BondCalculator`
- The fetching of the assets prices in dollar in the `CvgOracle`

We as the Convergence team wants to cover as much as possible thoose critical parts. Any breaches leading to a partial or a total locking of the funds will be rewarded in this audit competition.

Gas optimisation, unless if it's 20% of a tx will not be rewarded.

## Contracts to audit

### VestingCvg

The main role of the contract :

- As the owner of the contract, beeing able to create a `Vesting schedule`
- As an investor, being able to claim my $CVG regarding the parametrization of the `Vesting schedule` associated.

Several types of $CVG releases, each one linked to an NFT contract will be effective in the `VestingCvg``

- `SeedPresaleCvg` => For the most early investors ( contract already on mainnet [here](https://etherscan.io/address/0x06FEB7a047e540B8d92620a2c13Ec96e1FF5E19b))
- `WlPresaleCvg` => For the first round of the public sale ( contract already on mainnet [here](https://etherscan.io/address/0xc9740aa94a8a02a3373f5f1b493d7e10d99ae811))
- `Ibo` => For the second round of the public sale, this contract is not yet deployed on the mainnet.

Also, two other vesting types, thoose one directly linked to an address will be enabled for the TEAM and the DAO.

- Team : 12.75M $CVG
- DAO : 15M $CVG

### IBO ( Initial Bond Offering )

The IBO is using the same technology and logic as the Bond that we'll emit once the protocol will be live.

The logic behind the IBO is to sell $CVG vested at a discounted price compare to the launch price. The vested position is embedded in an NFT.

The base CVG price will be fixed ( as the token is not live yet ) at 0.33$. On this price, a discount between [14% - 20%] will be applied.
This discount is computed on the fly by the `BondCalculator`.
Investors will be able to deposit FRAX, CRV and CVX in echange of CVG.

In order to compute the underlaying amount of CVG vested, we need to fetch the price of the token used to invest. This job is done by the `CvgOracle`.

Basically, the formula of CvgOut is :

discountedPrice = 0.33 \* ROI with so discountedPrice < 0.33

amountCvgOut = (amountDepositedIn _ tokenPriceIn ) / (0.33 _ ROI)

### BondCalculator

Externalized contract that computes the ROI of the bond following the formula described in this [documentation](https://docs.cvg.finance/bonds-and-treasury/bonds/oracles-and-roi-computation).

### CvgOracle

Externalized contract fetching the price of the asset involved in the Bond.
All prices are fetched in dollar and are under 18 decimals.
