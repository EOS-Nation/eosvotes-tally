import { Accounts, Vote } from "../types/state";
import * as Eosio from "../types/eosio";

export function generateAccounts(votes: Vote[], delband: Eosio.Delband[], userres: Eosio.Userres[], voters: Eosio.Voters[], proxies = false): Accounts {
    const accounts: Accounts = {};
    const voted = new Set(); // track who has voted

    // Only track accounts who has casted votes
    for (const row of votes) {
        if (!accounts[row.voter]) accounts[row.voter] = {};
        if (!accounts[row.voter].votes) accounts[row.voter].votes = [];

        const account = accounts[row.voter];
        if (account.votes) account.votes.push(row);
        voted.add(row.voter);
    }

    // Load Voter Information
    for (const row of voters) {
        // Voter is only included if voted or proxied to a proxy who has voted
        if (voted.has(row.owner) || voted.has(row.proxy)) {
            if (!accounts[row.owner]) accounts[row.owner] = {};
            accounts[row.owner].voter_info = row;
        }
    }

    // Load Delegated Bandwidth
    for (const row of delband) {
        if (!accounts[row.from]) accounts[row.from] = {};
        accounts[row.from].self_delegated_bandwidth = row;
    }

    // Load User Resources
    for (const row of userres) {
        if (!accounts[row.owner]) accounts[row.owner] = {};
        accounts[row.owner].total_resources = row;
    }

    // Remove/Include proxies
    for (const owner of Object.keys(accounts)) {
        const account = accounts[owner];

        // Proxies
        if (proxies) {
            if (!account.voter_info) delete accounts[owner];
            else if (!account.voter_info.is_proxy) delete accounts[owner];
        // Not Proxies
        } else {
            if (account.voter_info && account.voter_info.is_proxy) delete accounts[owner];
        }
    }

    return accounts;
}

// export function generateProxies(votes: Vote[], delband: Eosio.Delband[], userres: Eosio.Userres[], voters: Eosio.Voters[]): Accounts {
//     // Calculate only proxies who have voted on proposals
//     const proxies = generateAccounts(votes, delband, userres, voters, true);

//     // Re-calculate weights of proxies based on `voter_info.staked`
//     for (const owner of Object.keys(proxies)) {
//         let staked = 0;
//         const proxy = proxies[owner];
//         if (proxy.voter_info) staked = proxy.voter_info.staked;

//         // Scan all voters
//         for (const voter of voters) {
//             if (owner === voter.proxy) staked += voter.staked;
//         }
//         // if (proxies[owner].voter_info) {
//         //     proxies[owner].voter_info.staked = 0;
//         // }
//     }
//     return proxies;
// }

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
