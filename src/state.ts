import { State, Tally, Stats } from "../types/state";

/**
 * Initial State
 */
export const state: State = {
    proposals: {},
    tallies: {},
    votes: {},
    voters: {},
    global: {
        block_num: -1,
        supply: "1000000000.0000 EOS",
        total_activated_stake: "3774551190700",
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
        stats: defaultStats(),
    };
}

/**
 * Default Tally Summary
 */
export function defaultStats(): Stats {
    return {
        votes: {
            total: 0,
        },
        staked: {
            total: 0,
        },
        proxies: {
            total: 0,
        },
    };
}
