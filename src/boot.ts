import { state } from "./state";
import { getAccount, getTableRows, log, warning, error } from "./utils";
import { Votes, Voters, Vote, Proposals, Proposal } from "../types/state";
import { updateTally, updateVoter } from "./updaters";

/**
 * Get all votes from `eosforumrcpp`
 */
async function getVotes() {
    // Params
    const limit = 500;
    let lower_bound: string = "0";

    // Data Containers
    const votes: Votes = [];

    // Iterate over `voters` table
    while (true) {
        const { rows, more } = await getTableRows<Vote>("eosforumrcpp", "eosforumrcpp", "vote", { limit, lower_bound });

        // Iterate over each vote and store results
        for (const row of rows) {
            lower_bound = String(row.id);
            votes.push(row);
        }
        // Stop loop
        if (more === false) { break; }
    }
    // Update votes state
    log({type: "boot::updateVotes", message: `votes: ${votes.length}`});
    state.votes = votes;
}

/**
 * Update voters
 */
async function getVoters() {
    const voters: Voters = {};

    for (const vote of state.votes) {
        const account_name = vote.voter;
        if (!voters[account_name]) await updateVoter(account_name);
    }
    // Update voters state
    log({type: "boot::updateVoters", message: `voters: ${Object.keys(state.voters).length}`});
    state.voters = voters;
}

/**
 * Get all proposals from `eosforumrcpp`
 */
async function getProposals() {
    // Params
    const limit = 99999;
    let lower_bound: string = "0";

    // Data Containers
    const proposals: Proposals = [];

    // Iterate over `voters` table
    while (true) {
        const { rows, more } = await getTableRows<Proposal>("eosforumrcpp", "eosforumrcpp", "proposal", { limit, lower_bound });

        // Iterate over each vote and store results
        for (const row of rows) {
            lower_bound = String(row.proposal_name);
            proposals.push(row);
        }
        // TO-DO
        if (more === true) error({error: 500, type: "boot::getProposals", message: `"TO-DO: [lower_bound] not implemented yet"`});

        // Stop loop
        if (more === false) break;
    }
    log({type: "boot::updateProposals", message: `proposals: ${proposals.length}`});
    state.proposals = proposals;
}

/**
 * Initial Boot
 */
export default async function boot() {
    await getVotes();
    await getVoters();
    await getProposals();
    await updateTally();
}
