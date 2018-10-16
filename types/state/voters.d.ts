import { VoterInfo, SelfDelegatedBandwidth } from "../eosio/get_account";

export interface Voters {
    /**
     * Voter Account Name
     */
    [account_name: string]: {
        self_delegated_bandwidth: SelfDelegatedBandwidth;
        voter_info: VoterInfo;
    }
}
