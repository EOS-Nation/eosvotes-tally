import { State, Tally, TallySummary } from "../types";

/**
 * Initial State
 */
export const state: State = {
    proposals: {},
    voters: {},
    indexState: {
        blockNumber: 0,
        blockHash: "",
    },
    global: {
        supply: "1000000000.0000 EOS",
        total_activated_stake: 3774551190700,
    },
};

/**
 * Default Tally
 */
export function defaultTally(blockNumber: number, blockHash: string): Tally {
    return Object.assign({
        proposer: "",
        proposal_name: "",
        title: "",
        proposal_json: {},
        active: true,
        expires_at: "",
        blockNumber,
        blockHash,
        firstBlockNumber: blockNumber,
        firstBlockHash: blockHash,
        voteParticipation: {
            supply: 0,
            total_activated_stake: 0,
        },
    }, defaultTallySummary());
}

/**
 * Default Tally Summary
 */
export function defaultTallySummary(): TallySummary {
    return {
        votes: {
            total: 0,
        },
        staked: {
            total: 0,
        },
        last_vote_weight: {
            total: 0,
        },
    };
}
