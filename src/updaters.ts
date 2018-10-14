// import { BlockInfo, Delegatebw, Payload, State, Tally, TallySummary, Vote } from "../types";
import { Vote } from "../types/eosforumrcpp";
import { Tallies } from "../types/state";
import { state, defaultSummary } from "./state";
import { getAccount, log, warning, error, calculateEosFromVotes } from "./utils";

/**
 * Vote - voter casts registers his vote on proposal
 */
export async function updateVote(vote: Vote) {
    // Add Vote to State
    state.votes.push(vote);

    // Update `voter_info` details
    await updateVoter(vote.voter);

    // Update Tally Count
    await updateTally();
}

/**
 * Update `voter_info` details
 *
 * @param {string} account_name Account Name
 */
export async function updateVoter(account_name: string) {
    const account = await getAccount(account_name);

    // Asserts
    if (account === null) return error({error: 404, type: "updaters::updateVoter", message: `[${account_name}] account does not exist`});

    // Handle missing voter_info table
    if (!account.voter_info) {
        warning({warning: 404, type: "updaters::updateVoter", message: `[${account_name}] account is missing [voter_info]`});
    } else {
        state.voters[account_name] = account.voter_info;
        log({type: "updaters::updateVoter", message: `updated voter_info for [${account_name}]`});
    }

}

/**
 * Update Tally Counts
 */
export async function updateTally() {
    // Empty container
    const tallies: Tallies = {};

    // Load proposals in tallies
    state.proposals.forEach((proposal) => {
        const {proposal_name} = proposal;
        tallies[proposal_name] = {
            proposal,
            summary: defaultSummary(),
        };
    });

    // Add votes to summary
    state.votes.forEach((voteRow) => {
        const { voter, proposal_name, vote } = voteRow;
        const voter_info = state.voters[voter];

        // Asserts
        if (!tallies[proposal_name]) return error({error: 500, type: "updaters::updateTally", message: `[${proposal_name}] proposal not found in [tallies]`});
        if (!voter_info) return error({error: 500, type: "updaters::updateTally", message: `[${voter}] is missing in [state.voters]`});

        tallies[proposal_name].summary.last_vote_weight[vote] += Number(voter_info.last_vote_weight);
        tallies[proposal_name].summary.last_vote_weight_eos[vote] += calculateEosFromVotes(voter_info.last_vote_weight);
        tallies[proposal_name].summary.staked[vote] += Number(voter_info.staked);
        tallies[proposal_name].summary.votes[vote] += 1;
    });

    // Finish
    state.tallies = tallies;
    log({type: "updaters::updateTally", message: "completed updating [state.tallies]"});
}

/**
 * Update Block Number
 */
export function updateBlockNumber(block_num: number) {
    state.global.block_num = block_num;
}
