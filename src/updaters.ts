import { Vote, Proposal } from "../types/eosforumrcpp";
import { GetAccount } from "../types/eosio";
import { Tallies } from "../types/state";
import { rpc } from "./config";
import { state, defaultStats } from "./state";
import { log, warning, error, calculateEosFromVotes, parseTokenString } from "./utils";
import { SelfDelegatedBandwidth, VoterInfo, Delband } from "../types/eosio";
import { CurrencyStats } from "../types/eosio.token";

/**
 * Vote - update `state.votes` & fetches account `voter_info`
 */
export function updateVote(vote: Vote) {
    log({ref: "updaters::updateVote", message: `${vote.voter} voted for ${vote.proposal_name} using ${vote.vote}`});
    state.votes[vote.id] = vote;
}

/**
 * Proposal - update `state.proposal`
 */
export function updateProposal(proposal: Proposal) {
    throw new Error("TO-DO: must handle proposals differently via snapshots");
    // log({ref: "updaters::updateProposal", message: `${proposal.proposal_name} updated`});
    // state.proposals[proposal.proposal_name] = proposal;
}

/**
 * Update `self_delegated_bandwidth`
 */
export function updateSelfDelegatedBandwidth(account_name: string, self_delegated_bandwidth: Delband) {
    throw new Error("TO-DO: must handle self_delegated_bandwidth differently via snapshots");
    // log({ref: "updaters::updateSelfDelegatedBandwidth", message: `${account_name} updated`});
    // state.voters[account_name].self_delegated_bandwidth = self_delegated_bandwidth;
}

/**
 * Update `voter_info`
 */
export function updateVoterInfo(account_name: string, voter_info: VoterInfo) {
    log({ref: "updaters::updateVoterInfo", message: `${account_name} updated`});
    state.voters[account_name].voter_info = voter_info;
}

/**
 * Update Block Number
 */
export function updateBlockNumber(block_num: number) {
    log({ref: "updaters::updateBlockNumber", message: `${block_num} updated`});
    state.global.block_num = block_num;
}

/**
 * Update `voter_info` details
 *
 * @param {string} account_name Account Name
 */
export async function updateVoter(account_name: string) {
    const account: GetAccount = await rpc.get_account(account_name);

    // Asserts
    if (account === null) return error({ref: "updaters::updateVoter", message: `[${account_name}] account does not exist`});

    // Handle missing voter_info table
    if (!account.voter_info) warning({ref: "updaters::updateVoter", message: `[${account_name}] account is missing [voter_info]`});
    if (!account.self_delegated_bandwidth) warning({ref: "updaters::updateVoter", message: `[${account_name}] account is missing [self_delegated_bandwidth]`});

    // Update Account
    state.voters[account_name] = {
        voter_info: account.voter_info,
        total_resources: account.total_resources,
        self_delegated_bandwidth: account.self_delegated_bandwidth,
    };

    log({ref: "updaters::updateVoter", message: `updated voter_info for [${account_name}]`});
}

/**
 * Update Tally Counts
 */
export async function updateTally() {
    // Empty container
    const tallies: Tallies = {};

    // Load proposals in tallies
    for (const proposalRow of state.proposals) {
        const { proposal_name } = proposalRow;
        tallies[proposal_name] = {
            proposal: proposalRow,
            stats: defaultStats(),
        };
    }

    // Add votes to summary
    for (const voteRow of state.votes) {
        const { voter, proposal_name, vote } = voteRow;
        const account = state.voters[voter];
        if (!account) {
            error({ref: "updaters::updateTally", message: `[${voter}] voter does not exist in [state.voters]`});
            continue;
        }
        const { voter_info, self_delegated_bandwidth } = account;

        // Asserts
        if (!tallies[proposal_name]) {
            error({ref: "updaters::updateTally", message: `[${proposal_name}] proposal not found in [tallies]`});
            continue;
        }
        if (!voter_info) warning({ref: "updaters::updateTally", message: `[${voter}] is missing [voter_info]`});
        if (!self_delegated_bandwidth) warning({ref: "updaters::updateTally", message: `[${voter}] is missing [self_delegated_bandwidth]`});

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

        // Update totals
        tallies[proposal_name].stats.proxies.total += proxies;
        tallies[proposal_name].stats.staked.total += staked;
        tallies[proposal_name].stats.votes.total += 1;
    }

    // Finish
    state.tallies = tallies;
    log({ref: "updaters::updateTally", message: "update completed [state.tallies]"});
}

export async function updateGlobal() {
    // eosio::global
    const global = await rpc.get_table_rows({code: "eosio", scope: "eosio", table: "global"});
    if (global && global.rows.length) {
        const { total_activated_stake } = global.rows[0];
        state.global.total_activated_stake = total_activated_stake;
        log({ref: "updaters::updateGlobal", message: "update completed [state.global.total_activated_stake]"});
    }
    // eosio.token::stat
    const currencyStats: CurrencyStats = await rpc.get_currency_stats("eosio.token", "EOS");
    if (currencyStats && currencyStats.EOS) {
        const { supply } = currencyStats.EOS;
        state.global.supply = supply;
        log({ref: "updaters::updateGlobal", message: "update completed [state.global.supply]"});
    }
    // eosio
    const getInfo = await rpc.get_info();
    if (getInfo) {
        state.global.block_num = getInfo.head_block_num;
        log({ref: "updaters::updateGlobal", message: "update completed [state.global.block_num]"});
    }
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
