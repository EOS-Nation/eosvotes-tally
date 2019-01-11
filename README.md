# EOSVotes.io Tally

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/EOS-Nation/eosvotes-tally-eosws/master/LICENSE)

EOS Votes tally quickly retrieves all proposals and votes from [`eosio.forum`](https://github.com/eoscanada/eosio.forum) and generate a simple to understand voting tally statistics in JSON format.

> Leveraging [dfuse.io](https://dfuse.io) under the hood to easily handle table deltas & snapshots.

## Install

```bash
$ git clone https://github.com/EOS-Nation/eosvotes-tally-eosws.git
$ cd eosvotes-tally-eosws
$ npm install
```

## Quickstart

```bash
$ npm start
```

## AWS S3 Buckets

All the related EOSVotes datasets/snapshots are stored as Amazon S3 buckets.

All snapshots (historical data) are stored in 1000 `block_num` intervals (every ~8 minutes).

Use `latest.json` for the latest uploaded dataset.

## 📊 Schema

```typescript
interface Tallies {
    proposal: Proposal;
    stats:    Stats;
}

interface Proposal {
    expires_at:    string;
    created_at:    string;
    proposal_json: string;
    title:         string;
    proposer:      string;
    proposal_name: string;
}

interface Stats {
    votes:              Votes;
    accounts:           Accounts;
    proxies:            Accounts;
    staked:             Accounts;
    vote_participation: boolean;
    more_yes:           boolean;
    sustained_days:     number;
    block_num:          number;
    currency_supply:    number;
}

interface Accounts {
    "0":    number;
    "1":    number;
    total:  number;
}

interface Votes {
    "0"?:     number;
    "1":      number;
    proxies:  number;
    accounts: number;
    total:    number;
}
```

## S3 Bucket URL template

- [https://s3.amazonaws.com/api.eosvotes.io/{scope}/{table}/{block_num}.json](https://s3.amazonaws.com/api.eosvotes.io/eosvotes/tallies/latest.json)

#### `eosvotes`

`eosvotes::tallies` (tallies for `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosvotes/tallies/latest.json

`eosvotes::accounts` (account details for `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosvotes/accounts/latest.json

`eosvotes::proxies` (proxies details for `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosvotes/proxies/latest.json


#### `eosio`

`eosio::delband` (self delegated bandwidth amount for all `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosio/delband/latest.json

`eosio::voters` (complete voters table)

- https://s3.amazonaws.com/api.eosvotes.io/eosio/voters/latest.json


#### `eosio.forum`

`eosio.forum::vote` (all votes)

- https://s3.amazonaws.com/api.eosvotes.io/eosio.forum/vote/latest.json

`eosio.forum::proposal` (all proposals)

- https://s3.amazonaws.com/api.eosvotes.io/eosio.forum/proposal/latest.json

