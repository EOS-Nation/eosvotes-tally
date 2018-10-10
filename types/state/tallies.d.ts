import { EOSForumProposeJSON } from "../eosforumrcpp";

export interface Tallies {
    /**
     * proposal_name
     */
    [proposal_name: string]: Tally,
}

export interface TallySummary {
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
}

export interface Tally extends EOSForumProposeJSON, TallySummary {
    /**
     * Proposal active or not
     */
    active: boolean;
    /**
     * Last Block Number
     */
    blockNumber: number;
    /**
     * Last Block Hash
     */
    blockHash: string;
    /**
     * First Block Number
     */
    firstBlockNumber: number;
    /**
     * First Block Hash
     */
    firstBlockHash: string;
    /**
     * Vote Participation
     */
    voteParticipation: VoteParticipation
}

/**
 * Vote Participation
 *
 * Token holders with no less than 15% vote participation
 */
export interface VoteParticipation {
    /**
     * Vote Participation: Percentage (EOS staked / Total EOS Supply "1B")
     */
    supply: number,
    /**
     * Vote Participation: Percentage (EOS staked / Total Activated Stake )
     */
    total_activated_stake: number,
}