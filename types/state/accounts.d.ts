import { VoterInfo, Userres, Delband } from "../eosio";
import { Vote } from "../eosforumrcpp";

export interface Accounts {
    /**
     * Account Information
     */
    [account_name: string]: {
        votes: {
            [proposal_name: string]: Vote;
        }
        staked: number;
        is_proxy: boolean;
        proxy: string;
    }
}
