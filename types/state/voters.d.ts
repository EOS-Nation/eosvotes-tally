import { VoterInfo } from "../eosio/get_account";

export interface Voters {
    /**
     * Voter Account Name
     */
    [account_name: string]: VoterInfo;
}
