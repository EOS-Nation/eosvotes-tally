import { Accounts } from "./accounts";
import { Proxies } from "./proxies";
import { Vote, Proposal } from "../eosio.forum";
import { Tallies, Tally, Stats } from "./tallies";
import { Global } from "./global";

export { Global, Tally, Accounts, Tallies, Vote, Proposal, Stats, Proxies };

export interface State {
    /**
     * Status of all proposals
     */
    proposals: Proposal[];
    /**
     * Status of all proposals
     */
    tallies: Tallies;
    /**
     * Account Information
     */
    accounts: Accounts;
    /**
     * Proxies Information
     */
    proxies: Accounts;
    /**
     * Status of Votes
     */
    votes: Vote[];
    /**
     * Global Statistics
     */
    global: Global;
}
