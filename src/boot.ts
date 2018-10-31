import { state } from "./state";
import { log, error } from "./utils";
import { Votes, Voters, Proposals } from "../types/state";
import { updateTally, updateVoter, updateGlobal } from "./updaters";
import { rpc } from "./config";

/**
 * Get all votes from `eosforumrcpp`
 */
export async function getVotes() {
    // Params
    const limit = 500;
    let lower_bound: string = "0";

    // Data Containers
    const votes: Votes = [];

    // Iterate over `voters` table
    while (true) {
        const { rows, more } = await rpc.get_table_rows({json: true, code: "eosforumrcpp", scope: "eosforumrcpp", table: "vote", limit, lower_bound });

        // Iterate over each vote and store results
        for (const row of rows) {
            lower_bound = String(row.id);
            votes.push(row);
            throw new Error("TO-DO: prevent duplicate rows must be tested");
        }
        // Stop loop
        if (more === false) { break; }
    }
    // Update votes state
    log({ref: "boot::updateVotes", message: `votes: ${Object.keys(votes).length}`});
    state.votes = votes;
}

/**
 * Update voters
 */
export async function getVoters() {
    const voters: Voters = {};

    for (const voteRow of state.votes) {
        const {voter} = voteRow;
        if (!voters[voter]) await updateVoter(voter);
    }
    // Update voters state
    log({ref: "boot::updateVoters", message: `voters: ${Object.keys(state.voters).length}`});
}

/**
 * Get all proposals from `eosforumrcpp`
 */
export async function getProposals() {
    // Params
    const limit = 99999;
    let lower_bound: string = "0";

    // Data Containers
    const proposals: Proposals = [];

    // Iterate over `voters` table
    while (true) {
        const { rows, more } = await rpc.get_table_rows({json: true, code: "eosforumrcpp", scope: "eosforumrcpp", table: "proposal", limit, lower_bound });

        // Iterate over each vote and store results
        for (const row of rows) {
            lower_bound = row.proposal_name;
            proposals.push(row);
            throw new Error("TO-DO: prevent duplicate rows must be tested");
        }
        // TO-DO
        if (more === true) error({ref: "boot::getProposals", message: `"TO-DO: [lower_bound] not implemented yet"`});

        // Stop loop
        if (more === false) break;
    }
    log({ref: "boot::updateProposals", message: `proposals: ${Object.keys(proposals).length}`});
    state.proposals = proposals;
}

/**
 * Initial Boot
 */
export default async function boot() {
    await updateGlobal();
    await getProposals();
    await getVotes();
    await getVoters();
    await updateTally();
}
