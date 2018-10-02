import { Proposals } from "./proposals";
import { Voters } from "./voters";
import { Global } from "./global";
export * from "./proposals";
export * from "./voters";
export * from "./global";

export interface State {
    /**
     * Status of all proposals
     */
    proposals: Proposals;
    /**
     * Status of Voters
     *
     * Used to track which proposals to update when undelegatebw & delegatebw actions occur
     */
    voters: Voters;
    /**
     * Global
     */
    global: Global;
    /**
     * Demux Index State
     */
    indexState: {
        blockNumber: number,
        blockHash: string,
    };
}
