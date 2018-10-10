import { BlockInfo, Delegatebw, Payload, State, Tally, TallySummary, Vote } from "../types";
import { EOSForumPropose, EOSForumProposeJSON, EOSForumExpire, EOSForumVote, EOSForumUnvote, EOSForumCleanProposal } from "../types";
import { logError } from "./logging";
import { defaultTally } from "./state";
import { getAccount, parseJSON, parseTokenString } from "./utils";

/**
 * Propose - creation of new proposal based on proposal_name
 */
function updatePropose(state: State, payload: Payload<EOSForumPropose>, blockInfo: BlockInfo) {
    const proposal_json = parseJSON(payload.data.proposal_json);
    const { proposer, proposal_name, title, expires_at } = payload.data;
    const { blockHash, blockNumber } = blockInfo;

    // Define Proposal with JSON proposal
    const proposal: EOSForumProposeJSON = {
        proposer,
        proposal_name,
        title,
        proposal_json,
        expires_at,
    };

    // Set default tally
    const tally: Tally = Object.assign(defaultTally(blockNumber, blockHash), proposal);

    // Reset or include proposals
    state.proposals[proposal_name] = tally;

    // Update Demux Index State
    state.indexState.blockHash = blockHash;
    state.indexState.blockNumber = blockNumber;
}

/**
 * Unpropose - removal of proposal based on proposal_name
 */
function updateExpire(state: State, payload: Payload<EOSForumExpire>) {
    const { proposal_name } = payload.data;

    // Delete proposals
    if (state.proposals[proposal_name]) { delete state.proposals[proposal_name]; }
}

/**
 * Vote - voter casts registers his vote on proposal
 */
async function updateVote(state: State, payload: Payload<EOSForumVote>, blockInfo: BlockInfo) {
    const eosforumVote = payload.data;
    const { proposal_name } = payload.data;
    const vote_json = parseJSON(payload.data.vote_json);

    // HTTP connection required to get account details
    const account = await getAccount(eosforumVote.voter);
    if (account === null) { return logError("getAccount", blockInfo.blockNumber, `error retrieving account [${eosforumVote.voter}]`); }

    // EOSVotes Vote
    const vote: Vote = Object.assign(eosforumVote, {vote_json});

    // Existing proposals
    const proposals = state.voters[eosforumVote.voter] ? state.voters[eosforumVote.voter].proposals : {};

    // Update Voter Info from EOSIO getAccount
    // Preserve existing proposals
    state.voters[eosforumVote.voter] = Object.assign(account.voter_info, {proposals});

    // Update vote details for target proposal
    state.voters[eosforumVote.voter].proposals[proposal_name] = vote;

    // Update Tally Status
    updateTally(state, blockInfo);

}

/**
 * Updates Tally State
 */
async function updateTally(state: State, blockInfo: BlockInfo) {
    const { blockNumber, blockHash } = blockInfo;

    // Summary of Votes
    const summary: {
        [proposal_name: string]: TallySummary,
    } = {};

    for (const account_name of Object.keys(state.voters)) {
        // Voter Information
        const voter = state.voters[account_name];

        // Iterate over each proposal
        for (const proposal_name of Object.keys(voter.proposals)) {
            const {vote} = voter.proposals[proposal_name];

            // Update Block Status
            if (state.proposals[proposal_name]) {
                state.proposals[proposal_name].blockNumber = blockNumber;
                state.proposals[proposal_name].blockHash = blockHash;
            } else {
                // Usually happens if EOSVotes tally started after the proposal
                logError("eosforumdapp::vote", blockNumber, `tally missing [${proposal_name}]`);

                // UPDATE missing `proposals`
                const proposal = await getProposal(EOSVOTES_CODE, proposal_name);

                if (proposal) {
                    // Set default tally
                    const tally: Tally = Object.assign(defaultTally(blockNumber, blockHash), proposal);

                    state.proposals[proposal_name] = tally;
                }
            }

            // Calculate Summary of Votes
            // Default Summary if not exist
            if (!summary[proposal_name]) {
                summary[proposal_name] = defaultTally(blockNumber, blockHash);
            }

            // Calculate Votes
            if (summary[proposal_name].votes[vote]) { summary[proposal_name].votes[vote] += 1; } else { summary[proposal_name].votes[vote] = 1; }
            summary[proposal_name].votes.total += 1;

            // Calculate Staked
            if (summary[proposal_name].staked[vote]) { summary[proposal_name].staked[vote] += voter.staked; } else { summary[proposal_name].staked[vote] = voter.staked; }
            summary[proposal_name].staked.total += voter.staked;

            // Calculate Last Vote Weight
            if (summary[proposal_name].last_vote_weight[vote]) { summary[proposal_name].last_vote_weight[vote] += Number(voter.last_vote_weight); } else { summary[proposal_name].last_vote_weight[vote] = Number(voter.last_vote_weight); }
            summary[proposal_name].last_vote_weight.total += Number(voter.last_vote_weight);
        }
    }

    // Save Tally Calculations
    const supply = parseTokenString(state.global.supply).amount;
    for (const proposal_name of Object.keys(summary)) {
        const votes = summary[proposal_name].votes;
        const staked = summary[proposal_name].staked;
        const last_vote_weight = summary[proposal_name].last_vote_weight;

        // Update Proposals with Summary statistics
        state.proposals[proposal_name].votes = votes;
        state.proposals[proposal_name].staked = staked;
        state.proposals[proposal_name].last_vote_weight = last_vote_weight;

        // Update Vote Participation
        // => Total EOS Voting Staked / Total EOS Supply (~1B)
        state.proposals[proposal_name].voteParticipation.supply = (staked.total / 10000) / supply;
        state.proposals[proposal_name].voteParticipation.total_activated_stake = staked.total / state.global.total_activated_stake;
    }
}

/**
 * Update Delegatebw & Undelegatebw
 */
async function updateDelegatebw(state: State, payload: Delegatebw, blockInfo: BlockInfo) {
    const { from, receiver } = payload.data;

    // Update Voter Delegated Resources
    if (state.voters[from]) { await updateVoter(from, state, blockInfo); }
    if (state.voters[receiver]) { await updateVoter(receiver, state, blockInfo); }
}

/**
 * Update Voter Delegated Resources
 */
async function updateVoter(account_name: string, state: State, blockInfo: BlockInfo) {
    // HTTP connection required to get account details
    const account = await getAccount(account_name);
    if (account === null) { return logError("getAccount", blockInfo.blockNumber, `error retrieving account [${account_name}]`); }

    // Update Voter Info from EOSIO getAccount
    state.voters[account_name] = Object.assign(state.voters[account_name], account.voter_info);
    // Update Tally Status
    await updateTally(state, blockInfo);
}

/**
 * Unvote - remove proposal_name from voter state
 */
async function updateUnvote(state: State, payload: Payload<EOSForumUnvote>, blockInfo: BlockInfo) {
    const { proposal_name, voter } = payload.data;

    // Remove voter proposals
    if (state.voters[voter] && state.voters[voter].proposals[proposal_name]) { delete state.voters[voter].proposals[proposal_name]; }

    await updateTally(state, blockInfo);
}

/**
 * Clean Proposal - remove proposal_name from voter state
 */
async function updateCleanProposal(state: State, payload: Payload<EOSForumCleanProposal>, blockInfo: BlockInfo) {
    const { proposal_name } = payload.data;

    // Remove proposal from all voters
    for (const voter of Object.keys(state.voters)) {
        if (state.voters[voter].proposals[proposal_name]) { delete state.voters[voter].proposals[proposal_name]; }
    }

    await updateTally(state, blockInfo);
}

export default [
    {
        actionType: `${EOSVOTES_CODE}::propose`,
        updater: updatePropose,
    },
    {
        actionType: `${EOSVOTES_CODE}::expire`,
        updater: updateExpire,
    },
    {
        actionType: `${EOSVOTES_CODE}::vote`,
        updater: updateVote,
    },
    {
        actionType: `${EOSVOTES_CODE}::unvote`,
        updater: updateUnvote,
    },
    {
        actionType: `${EOSVOTES_CODE}::clnproposal`,
        updater: updateCleanProposal,
    },
    {
        actionType: `eosio::delegatebw`,
        updater: updateDelegatebw,
    },
    {
        actionType: `eosio::undelegatebw`,
        updater: updateDelegatebw,
    },
];
