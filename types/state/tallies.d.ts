import { Proposal } from "../eosforumrcpp/proposal";

export interface Tallies {
    /**
     * proposal_name
     */
    [proposal_name: string]: Tally,
}

export interface Tally {
    stats: Stats;
    proposal: Proposal;
}

export interface Stats {
    /**
     * Total number of votes per account & proxies
     */
    votes: {
        [vote: number]: number
        proxies: number,
        accounts: number,
        total: number,
    };
    /**
     * Accounts Staked
     *
     * Staked weight is calculated using `voter_info.staked` or `self_delegated_bandwidth`
     */
    accounts: {
        [vote: number]: number
        total: number,
    };
    /**
     * Proxies Staked
     *
     * Whenever a proxy votes on a proposal, a sum of each account's staked which have NOT voted for a proposal will counted.
     */
    proxies: {
        [vote: number]: number
        total: number,
    };
    /**
     * Total Staked between both accounts & proxies
     */
    staked: {
        [vote: number]: number
        total: number,
    };
}
