import { Proposal } from "../eosforumrcpp/proposal";

export interface Tallies {
    /**
     * proposal_name
     */
    [proposal_name: string]: Tally,
}

export interface Tally {
    id: string;
    stats: Stats;
    proposal: Proposal;
}

export interface Stats {
    /**
     * Block Number used for Tally calculations
     */
    block_num: number;
    /**
     * Currency Supply used for Tally calculations
     */
    currency_supply: number;
    /**
     * No less than 15% vote participation among tokens
     */
    vote_participation: boolean;
    /**
     * No fewer than 10% more Yes than No votes (true/false)
     */
    more_yes: boolean;
    /**
     * Sustained for 30 continuous days within a 120 day period. (true/false)
     */
    sustained_days: number;
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
