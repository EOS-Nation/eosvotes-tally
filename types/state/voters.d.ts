import { VoterInfo } from "../eosio/chain/get_account";

export interface Voters {
    /**
     * Voter Account Name
     */
    [account_name: string]: Voter;
}

export interface Vote {
    /**
     * eosio.forum Vote value
     */
    vote: number;
    /**
     * eosio.forum Vote JSON
     */
    vote_json: object;
}

export interface Voter extends VoterInfo {
    /**
     * proposer => proposal_name
     */
    proposals: {
        [proposal_name: string]: Vote,
    };
}
