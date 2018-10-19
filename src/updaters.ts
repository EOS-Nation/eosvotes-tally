// import { BlockInfo, Delegatebw, Payload, State, Tally, TallySummary, Vote } from "../types";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { GetAccount } from "../types/eosio";
import { Tallies } from "../types/state";
import { rpc } from "./config";
import { state, defaultStats } from "./state";
import { log, warning, error, calculateEosFromVotes, parseTokenString } from "./utils";
import { SelfDelegatedBandwidth, VoterInfo } from "../types/eosio";
import { CurrencyStats } from "../types/eosio.token";

/**
 * Vote - update `state.votes` & fetches account `voter_info`
 */
export async function updateVote(vote: Vote) {
    state.votes[vote.id] = vote;
    await updateVoter(vote.voter);
    await updateTally();
}

/**
 * Proposal - update `state.proposal`
 */
export async function updateProposal(proposal: Proposal) {
    state.proposals[proposal.proposal_name] = proposal;
    await updateTally();
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

    // Update voter
    state.voters[account_name] = {
        self_delegated_bandwidth: account.self_delegated_bandwidth,
        voter_info: account.voter_info,
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
    for (const proposal_name of Object.keys(state.proposals)) {
        const proposal = state.proposals[proposal_name];
        tallies[proposal_name] = {
            proposal,
            stats: defaultStats(),
        };
    }

    // Add votes to summary
    for (const vote_id of Object.keys(state.votes)) {
        const voteRow = state.votes[vote_id];
        const { voter, proposal_name, vote } = voteRow;
        const { voter_info, self_delegated_bandwidth } = state.voters[voter];

        // Asserts
        if (!tallies[proposal_name]) return error({ref: "updaters::updateTally", message: `[${proposal_name}] proposal not found in [tallies]`});
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

/**
 * Update Block Number
 */
export function updateBlockNumber(block_num: number) {
    state.global.block_num = block_num;
}

(async () => {
    await updateGlobal();
})();
