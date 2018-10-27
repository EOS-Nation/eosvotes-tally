# EOSVotes.io Tally

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/EOS-Nation/eosvotes-tally-eosws/master/LICENSE)

EOS Votes tally quickly retrieves all proposals and votes from [`eosforumrcpp`](https://github.com/eoscanada/eosio.forum) and generate a simple to understand voting tally statistics in JSON format.

> Leveraging [dfuse.io](https://dfuse.io) under the hood to easily handle table deltas via their [WebSocket API](https://github.com/dfuse-io/eosws-js).

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

Open your favorite browser to [localhost:3000](http://localhost:3000)

## Main API

- [https://api.eosvotes.io](https://api.eosvotes.io)

## Data API

- [https://api.eosvotes.io/tallies](https://api.eosvotes.io/tallies)
- [https://api.eosvotes.io/proposals](https://api.eosvotes.io/proposals)
- [https://api.eosvotes.io/votes](https://api.eosvotes.io/voters)
- [https://api.eosvotes.io/voters](https://api.eosvotes.io/voters)
- [https://api.eosvotes.io/global](https://api.eosvotes.io/global)

## Scoped API

- `https://api.eosvotes.io/tallies/{proposal_name}`
- `https://api.eosvotes.io/proposal/{proposal_name}`
- `https://api.eosvotes.io/voters/{voter}`

## Snapshots API (not implemented)

- `https://api.eosvotes.io/snapshots/eosio/voters/{block_number}`
- `https://api.eosvotes.io/snapshots/eosforumrcpp/vote/{block_number}`
