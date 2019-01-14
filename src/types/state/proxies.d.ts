import { VoterInfo, Userres, Delband } from "../eosio";
import { Vote } from "../eosio.forum";

export interface ProxiesVote extends Vote {
    staked_proxy: number;
}

export interface Proxies {
    /**
     * Account Information
     */
    [account_name: string]: {
        votes: {
            [proposal_name: string]: ProxiesVote;
        }
        staked: number;
        is_proxy: boolean;
        proxy: string;
    }
}
