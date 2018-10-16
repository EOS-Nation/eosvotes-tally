// import { BlockInfo, Delegatebw, Payload, State, Tally, TallySummary, Vote } from "../types";
import { Vote } from "../types/eosforumrcpp";
import { Tallies } from "../types/state";
import { state, defaultStats } from "./state";
import { getAccount, log, warning, error, calculateEosFromVotes, parseTokenString } from "./utils";
import { SelfDelegatedBandwidth, VoterInfo } from "../types/eosio";

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
    if (!account.voter_info) warning({warning: 404, type: "updaters::updateVoter", message: `[${account_name}] account is missing [voter_info]`});
    if (!account.self_delegated_bandwidth) warning({warning: 404, type: "updaters::updateVoter", message: `[${account_name}] account is missing [self_delegated_bandwidth]`});

    // Update voter
    state.voters[account_name] = {
        self_delegated_bandwidth: account.self_delegated_bandwidth,
        voter_info: account.voter_info,
    };
    log({type: "updaters::updateVoter", message: `updated voter_info for [${account_name}]`});
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
            stats: defaultStats(),
        };
    });

    // Add votes to summary
    state.votes.forEach((voteRow) => {
        const { voter, proposal_name, vote } = voteRow;
        const { voter_info, self_delegated_bandwidth } = state.voters[voter];

        // Asserts
        if (!tallies[proposal_name]) return error({error: 500, type: "updaters::updateTally", message: `[${proposal_name}] proposal not found in [tallies]`});
        if (!voter_info) warning({warning: 404, type: "updaters::updateTally", message: `[${voter}] is missing [voter_info]`});
        if (!self_delegated_bandwidth) warning({warning: 404, type: "updaters::updateTally", message: `[${voter}] is missing [self_delegated_bandwidth]`});

        // Update tallies to zero if no records were found
        if (!tallies[proposal_name].stats.staked[vote]) tallies[proposal_name].stats.staked[vote] = 0;
        if (!tallies[proposal_name].stats.proxies[vote]) tallies[proposal_name].stats.proxies[vote] = 0;
        if (!tallies[proposal_name].stats.votes[vote]) tallies[proposal_name].stats.votes[vote] = 0;

        // Count voting weights
        const staked = countStaked(self_delegated_bandwidth);
        const proxies = countProxies(voter_info);

        // Update tally stats
        tallies[proposal_name].stats.proxies[vote] += proxies;
        tallies[proposal_name].stats.staked[vote] += staked;
        tallies[proposal_name].stats.votes[vote] += 1;
    });
    // Finish
    state.tallies = tallies;
    log({type: "updaters::updateTally", message: "completed updating [state.tallies]"});
}

export function countStaked(self_delegated_bandwidth: SelfDelegatedBandwidth) {
    if (!self_delegated_bandwidth) return 0;
    const cpu = parseTokenString(self_delegated_bandwidth.cpu_weight).amount;
    const net = parseTokenString(self_delegated_bandwidth.net_weight).amount;
    return cpu + net;
}

export function countProxies(voter_info: VoterInfo) {
    if (!voter_info) return 0;
    if (voter_info.is_proxy) return calculateEosFromVotes(voter_info.proxied_vote_weight);
    return calculateEosFromVotes(voter_info.last_vote_weight);
}

/**
 * Update Block Number
 */
export function updateBlockNumber(block_num: number) {
    state.global.block_num = block_num;
}
