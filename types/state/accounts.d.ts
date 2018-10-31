import { VoterInfo, Userres, Delband } from "../eosio";

export interface Accounts {
    /**
     * Account Information
     */
    [account_name: string]: {
        voter_info?: VoterInfo
        total_resources?: Userres
        self_delegated_bandwidth?: Delband
    }
}
