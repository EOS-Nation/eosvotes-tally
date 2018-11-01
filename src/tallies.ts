import { Accounts, Vote, Proposal, Tallies, Tally, Stats } from "../types/state";
import { parseTokenString } from "./utils";
import * as Eosio from "../types/eosio";

function defaultAccount() {
    return {
        votes: {},
        staked: 0,
        proxy: "",
        is_proxy: false,
    };
}

export function defaultStats(): Stats {
    return {
        votes: {
            total: 0,
            proxies: 0,
            accounts: 0,
        },
        accounts: {
            total: 0,
        },
        proxies: {
            total: 0,
        },
    };
}

export function countStaked(delband: Eosio.Delband) {
    if (!delband) return 0;
    const cpu = parseTokenString(delband.cpu_weight).amount;
    const net = parseTokenString(delband.net_weight).amount;
    return cpu + net;
}

export function generateAccounts(votes: Vote[], delband: Eosio.Delband[], userres: Eosio.Userres[], voters: Eosio.Voters[], proxies = false): Accounts {
    const accounts: Accounts = {};
    const voted = new Set(); // track who has voted

    // Only track accounts who has casted votes
    for (const row of votes) {
        if (!accounts[row.voter]) accounts[row.voter] = defaultAccount();

        const account = accounts[row.voter];
        if (account.votes) account.votes[row.proposal_name] = row;
        voted.add(row.voter);
    }

    // Load Voter Information
    for (const row of voters) {
        const owner = row.owner;

        // Voter is only included if voted or proxied to a proxy who has voted
        if (voted.has(owner) || voted.has(row.proxy)) {
            if (!accounts[owner]) accounts[owner] = defaultAccount();
            accounts[owner].staked = row.staked;
            accounts[owner].is_proxy = Boolean(row.is_proxy);
            accounts[owner].proxy = row.proxy;
        }
    }

    // Load Self Delegated Bandwidth
    for (const row of delband) {
        const owner = row.from;
        if (!accounts[owner]) accounts[owner] = defaultAccount();
        if (!accounts[owner].staked) accounts[owner].staked = countStaked(row);
    }

    // Remove/Include proxies
    for (const owner of Object.keys(accounts)) {
        const account = accounts[owner];

        // Proxies
        if (proxies !== account.is_proxy) delete accounts[owner];
    }

    return accounts;
}

export function generateTallies(proposals: Proposal[], accounts: Accounts, proxies: Accounts): Tallies {
    const tallies: Tallies = {};

    for (const proposal of proposals) {
        tallies[proposal.proposal_name] = generateTally(proposal, accounts, proxies);
    }
    return tallies;
}

export function generateTally(proposal: Proposal, accounts: Accounts, proxies: Accounts): Tally {
    const { proposal_name } = proposal;
    const stats = defaultStats();

    // Calculate account's staked
    for (const owner of Object.keys(accounts)) {
        const { staked, votes } = accounts[owner];

        if (votes[proposal_name]) {
            const { vote } = votes[proposal_name];
            // Set to 0 if undefined
            if (!stats.accounts[vote]) stats.accounts[vote] = 0;
            if (!stats.votes[vote]) stats.votes[vote] = 0;

            // Add voting weights
            stats.accounts[vote] += staked;
            stats.accounts.total += staked;

            // Voting Count
            stats.votes[vote] += 1;
            stats.votes.total += 1;
            stats.votes.accounts += 1;
        }
    }
    // Calculate proxies's staked
    for (const owner of Object.keys(proxies)) {
        const { staked, votes } = proxies[owner];

        if (votes[proposal_name]) {
            const { vote } = votes[proposal_name];
            // Set to 0 if undefined
            if (!stats.accounts[vote]) stats.accounts[vote] = 0;
            if (!stats.votes[vote]) stats.votes[vote] = 0;

            // Add voting weights
            stats.accounts[vote] += staked;
            stats.accounts.total += staked;

            // Voting Count
            stats.votes[vote] += 1;
            stats.votes.total += 1;
            stats.votes.proxies += 1;
        }
    }
    // Additional proxied staked weights via account's staked who have no voted
    for (const proxy of Object.keys(proxies)) {
        const proxyAccount = proxies[proxy];
        // Skip proxy, did not vote for proposal
        if (!proxyAccount.votes[proposal_name]) continue;

        const { vote } = proxyAccount.votes[proposal_name];
        let staked = 0;

        for (const owner of Object.keys(accounts)) {
            const account = accounts[owner];

            // Skip user isn't using this proxy
            if (account.proxy !== proxy) continue;

            // Skip user has already voted
            if (account.votes[proposal_name]) continue;

            // Add user's stake to proxies
            staked += account.staked;
        }

        // Set to 0 if undefined
        if (!stats.proxies[vote]) stats.proxies[vote] = 0;

        stats.proxies[vote] += staked;
        stats.proxies.total += staked;
    }

    return {
        proposal,
        stats,
    };
}
