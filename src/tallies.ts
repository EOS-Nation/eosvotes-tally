import { Tallies, Accounts, Vote, Proposal } from "../types/state";
import * as Eosio from "../types/eosio";
import { defaultStats } from "./state";
import { warning, error, log, parseTokenString, calculateEosFromVotes } from "./utils";

export function generateAccounts(votes: Vote[], delband: Eosio.Delband[], userres: Eosio.Userres[], voters: Eosio.Voters[]): Accounts {
    const accounts: Accounts = {};

    // Only track accounts who has casted votes
    for (const row of votes) {
        accounts[row.voter] = {};
    }

    // Load Delegated Bandwidth
    for (const row of delband) {
        if (accounts[row.from]) accounts[row.from].self_delegated_bandwidth = row;
    }

    // Load User Resources
    for (const row of userres) {
        if (accounts[row.owner]) accounts[row.owner].total_resources = row;
    }

    // Load Voter Information
    for (const row of voters) {
        if (accounts[row.owner]) accounts[row.owner].voter_info = row;
    }
    return accounts;
}

// /**
//  * Generate Tallies
//  */
// export async function generateTallies(voters: Accounts, votes: Vote[], proposals: Proposal[]) {
//     // Empty container
//     const tallies: Tallies = {};

//     // Load proposals in tallies
//     for (const proposalRow of proposals) {
//         const { proposal_name } = proposalRow;
//         tallies[proposal_name] = {
//             proposal: proposalRow,
//             stats: defaultStats(),
//         };
//     }

//     // Add votes to summary
//     for (const voteRow of votes) {
//         const { voter, proposal_name, vote } = voteRow;
//         const account = voters[voter];
//         if (!account) {
//             error({ref: "updaters::updateTally", message: `[${voter}] voter does not exist in [state.voters]`});
//             continue;
//         }
//         const { voter_info, self_delegated_bandwidth } = account;

//         // Asserts
//         if (!tallies[proposal_name]) {
//             error({ref: "updaters::updateTally", message: `[${proposal_name}] proposal not found in [tallies]`});
//             continue;
//         }
//         if (!voter_info) warning({ref: "updaters::updateTally", message: `[${voter}] is missing [voter_info]`});
//         if (!self_delegated_bandwidth) warning({ref: "updaters::updateTally", message: `[${voter}] is missing [self_delegated_bandwidth]`});

//         // Update tallies to zero if no records were found
//         if (!tallies[proposal_name].stats.staked[vote]) tallies[proposal_name].stats.staked[vote] = 0;
//         if (!tallies[proposal_name].stats.proxies[vote]) tallies[proposal_name].stats.proxies[vote] = 0;
//         if (!tallies[proposal_name].stats.votes[vote]) tallies[proposal_name].stats.votes[vote] = 0;

//         // Count voting weights
//         const staked = countStaked(self_delegated_bandwidth);
//         const proxies = countProxies(voter_info);

//         // Update tally stats
//         tallies[proposal_name].stats.proxies[vote] += proxies;
//         tallies[proposal_name].stats.staked[vote] += staked;
//         tallies[proposal_name].stats.votes[vote] += 1;

//         // Update totals
//         tallies[proposal_name].stats.proxies.total += proxies;
//         tallies[proposal_name].stats.staked.total += staked;
//         tallies[proposal_name].stats.votes.total += 1;
//     }

//     // Finish
//     log({ref: "updaters::updateTally", message: "update completed [state.tallies]"});
//     return tallies;
// }

// export function countStaked(self_delegated_bandwidth: Eosio.Delband) {
//     if (!self_delegated_bandwidth) return 0;
//     const cpu = parseTokenString(self_delegated_bandwidth.cpu_weight).amount;
//     const net = parseTokenString(self_delegated_bandwidth.net_weight).amount;
//     return cpu + net;
// }

// export function countProxies(voter_info: Eosio.VoterInfo) {
//     if (!voter_info) return 0;
//     if (voter_info.is_proxy) return calculateEosFromVotes(voter_info.proxied_vote_weight);
//     return calculateEosFromVotes(voter_info.last_vote_weight);
// }
