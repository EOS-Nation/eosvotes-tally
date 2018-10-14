import { State, Tally, Summary } from "../types/state";

/**
 * Initial State
 */
export const state: State = {
    proposals: [],
    tallies: {},
    votes: [],
    voters: {},
    global: {
        block_num: 0,
        supply: "1000000000.0000 EOS",
        total_activated_stake: 3774551190700,
    },
};

/**
 * Default Tally
 */
export function defaultTally(): Tally {
    return {
        proposal: {
            proposal_name: "",
            proposer: "",
            title: "",
            proposal_json: "",
            created_at: "",
            expires_at: "",
        },
        summary: defaultSummary(),
    };
}

/**
 * Default Tally Summary
 */
export function defaultSummary(): Summary {
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
        last_vote_weight_eos: {
            total: 0,
        },
    };
}
