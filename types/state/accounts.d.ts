import { VoterInfo, Userres, Delband } from "../eosio";
import { Vote } from "../eosforumrcpp";

export interface Accounts {
    /**
     * Account Information
     */
    [account_name: string]: {
        voter_info?: VoterInfo
        total_resources?: Userres
        self_delegated_bandwidth?: Delband
        votes?: Vote[];
    }
}
