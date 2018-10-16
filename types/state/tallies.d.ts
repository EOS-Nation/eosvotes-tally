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
     * Votes
     *
     * Total amount of votes per account
     *  - includes proxies & accounts
     */
    votes: {
        [vote: number]: number
        total: number,
    };
    /**
     * Staked
     *
     * Calculates the sum of `net_weight` + `cpu_weight` within `self_delegated_bandwidth` in EOS
     *  - excludes proxies
     */
    staked: {
        [vote: number]: number
        total: number,
    };
    /**
     * Proxies
     *
     * Calculates the total of `last_vote_weight` or `proxied_vote_weight` in EOS
     *  - includes vote decay
     *  - includes proxies
     *  - excludes voters `last_vote_weight` if voted via proxy
     *  - excludes voters without `vote_info` table
     */
    proxies: {
        [vote: number]: number
        total: number,
    };
}
