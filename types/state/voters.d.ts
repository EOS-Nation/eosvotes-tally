import { VoterInfo, Userres, Delband } from "../eosio";

export interface Voters {
    /**
     * Voter Information
     */
    [account_name: string]: {
        voter_info?: VoterInfo
        total_resources?: Userres
        self_delegated_bandwidth?: Delband
    }
}
