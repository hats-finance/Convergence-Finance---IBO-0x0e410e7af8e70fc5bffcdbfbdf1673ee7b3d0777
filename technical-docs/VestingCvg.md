# VestingCvg

## Description

The `VestingCvg` is used to vest in the time the CVG token for seeders, presalers, ibo, team and the dao.
Owner of this contract will need to transfer CVG tokens on it and create the vesting schedule associated to the type of the vesting, to lock the CVGs into it.
Only users who owns the NFTs from `SeedPresaleCvg`, `WlPresaleCvg` and `Ibo` can `release` the associated CVG to the given NFT.
For the team and dao allocation, only the associated addresses will be able to `releaseTeamOrDao`.

## CreateVestingSchedule

```mermaid
sequenceDiagram
    DAO Multisig->>+VestingCvg: createVestingSchedule
    note over VestingCvg: Check OWNER
    note over VestingCvg: Check PRESALE_ROUND_NOT_FINISHED
    note over VestingCvg: Check AMOUNT is valid
    alt _vestingType == TYPE_TEAM
        note over VestingCvg: Check WRONG_AMOUNT_TEAM
    end
    alt _vestingType == TYPE_DAO
        note over VestingCvg: Check WRONG_AMOUNT_DAO
    end
    VestingCvg->>VestingCvg: Increment vestingSchedulesTotalAmount
    VestingCvg->>VestingCvg: Create vesting schedule
```

## RevokeVestingSchedule

```mermaid
sequenceDiagram
    DAO Multisig->>+VestingCvg: revokeVestingSchedule
    note over VestingCvg: Check IRREVOCABLE
    VestingCvg->>VestingCvg: Update vestingSchedulesTotalAmount
    VestingCvg->>VestingCvg: Revoke vesting schedule
```

## ReleaseSeed

```mermaid
sequenceDiagram
    SeedOwner->>+VestingCvg: releaseSeed
    note over VestingCvg: Check NOT_OWNED
    VestingCvg-->>VestingCvg: Retrieve amount regarding the current time and the amount already released
    note over VestingCvg: Check NOT_RELEASABLE
    note over VestingCvg: Check VESTING_REVOKED
    VestingCvg->>VestingCvg: Update CVG total claimed for the vestingSchedule
    VestingCvg->>VestingCvg: Update CVG claimed for the token
    VestingCvg->>VestingCvg: Update CVG total claimed for all vestingShedules
    VestingCvg->>+CVG: transfer CVG tokens to token owner
```

## ReleaseWl

```mermaid
sequenceDiagram
    WhitelistedOwner->>+VestingCvg: releaseWl
    note over VestingCvg: Check NOT_OWNED
    VestingCvg-->>VestingCvg: Retrieve amount regarding the current time and the amount already released
    note over VestingCvg: Check NOT_RELEASABLE
    note over VestingCvg: Check VESTING_REVOKED
    VestingCvg->>VestingCvg: Update CVG total claimed for the vestingSchedule
    VestingCvg->>VestingCvg: Update CVG claimed for the token
    VestingCvg->>VestingCvg: Update CVG total claimed for all vestingShedules
    VestingCvg->>+CVG: transfer CVG tokens to token owner
```

## ReleaseIbo

```mermaid
sequenceDiagram
    IboOwner->>+VestingCvg: releaseIbo
    note over VestingCvg: Check NOT_OWNED
    VestingCvg-->>VestingCvg: Retrieve amount regarding the current time and the amount already released
    note over VestingCvg: Check NOT_RELEASABLE
    note over VestingCvg: Check VESTING_REVOKED
    VestingCvg->>VestingCvg: Update CVG total claimed for the vestingSchedule
    VestingCvg->>VestingCvg: Update CVG claimed for the token
    VestingCvg->>VestingCvg: Update CVG total claimed for all vestingShedules
    VestingCvg->>+CVG: transfer CVG tokens to token owner
```

## ReleaseTeamOrDao

```mermaid
sequenceDiagram
    TeamOrDaoAddress->>+VestingCvg: releaseTeamOrDao
    VestingCvg-->>VestingCvg: Retrieve amount regarding the current time and the amount already released
    note over VestingCvg: Check NOT_RELEASABLE
    alt isTeam==true
        note over VestingCvg: Check NOT_TEAM
        VestingCvg->>VestingCvg: Update CVG claimed for team
    else isTeam==false
        note over VestingCvg: Check NOT_DAO
        VestingCvg->>VestingCvg: Update CVG claimed for dao
    end
    VestingCvg->>VestingCvg: Update CVG total claimed for the vestingSchedule
    VestingCvg->>VestingCvg: Update CVG total claimed for all vestingShedules
    VestingCvg->>+CVG: transfer CVG tokens to msg.sender
```