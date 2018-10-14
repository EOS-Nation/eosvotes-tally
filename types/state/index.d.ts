import { Proposals } from "./proposals";
import { Voters } from "./voters";
import { Votes } from "./votes";
import { Tallies } from "./tallies";
import { Global } from "./global";

export * from "./proposals";
export * from "./tallies";
export * from "./voters";
export * from "./votes";
export * from "./global";

export interface State {
    /**
     * Status of all proposals
     */
    proposals: Proposals;
    /**
     * Status of all proposals
     */
    tallies: Tallies;
    /**
     * Status of Voters
     *
     * Used to track which proposals to update when undelegatebw & delegatebw actions occur
     */
    voters: Voters;
    /**
     * Status of Votes
     */
    votes: Votes;
    /**
     * Global
     */
    global: Global;
}
