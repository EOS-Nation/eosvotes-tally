import { Proposal } from "../eosforumrcpp/proposal";

export interface Tallies {
    /**
     * proposal_name
     */
    [proposal_name: string]: Tally,
}

export interface Tally {
    summary: Summary;
    proposal: Proposal;
}

export interface Summary {
    /**
     * total amount of votes
     */
    votes: {
        [vote: number]: number
        total: number,
    };
    /**
     * total `staked` votes (divide by 10000 for EOS precision)
     */
    staked: {
        [vote: number]: number
        total: number,
    };
    /**
     * total `last_vote_weight` votes
     */
    last_vote_weight: {
        [vote: number]: number
        total: number,
    };
    /**
     * total `last_vote_weight` in EOS (includes vote decay)
     */
    last_vote_weight_eos: {
        [vote: number]: number
        total: number,
    };
}

/**
 * Vote Participation
 *
 * Token holders with no less than 15% vote participation
 */
export interface Stats {
    /**
     * Vote Participation: Percentage (EOS staked / Total EOS Supply "1B")
     */
    supply: number,
    /**
     * Vote Participation: Percentage (EOS staked / Total Activated Stake )
     */
    total_activated_stake: number,
}