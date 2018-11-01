# EOSVotes.io Tally

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/EOS-Nation/eosvotes-tally-eosws/master/LICENSE)

EOS Votes tally quickly retrieves all proposals and votes from [`eosforumrcpp`](https://github.com/eoscanada/eosio.forum) and generate a simple to understand voting tally statistics in JSON format.

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

All snapshots (historical data) are stored using `block_num % 7200` (every 1 hour).

Use `latest.json` for the latest uploaded dataset.

### 📊 Schema

S3 Bucket URL template

- https://s3.amazonaws.com/api.eosvotes.io/{scope}/{table}/{block_num}.json

#### `eosvotes`

`eosvotes::tallies` (tallies for `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosvotes/tallies/latest.json

`eosvotes::accounts` (account details for `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosvotes/accounts/latest.json


#### `eosio`

`eosio::delband` (self delegated bandwidth amount for all `eosio.forum` voters)

- https://s3.amazonaws.com/api.eosvotes.io/eosio/delband/latest.json

`eosio::voters` (complete voters table)

- https://s3.amazonaws.com/api.eosvotes.io/eosio/voters/latest.json


#### `eosforumrcpp`

`eosforumrcpp::vote` (all votes)

- https://s3.amazonaws.com/api.eosvotes.io/eosforumrcpp/vote/latest.json

`eosforumrcpp::proposal` (all proposals)

- https://s3.amazonaws.com/api.eosvotes.io/eosforumrcpp/proposal/latest.json

