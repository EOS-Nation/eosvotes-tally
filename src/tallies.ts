import { Accounts, Vote, Proxies, Proposal, Tallies, Tally, Stats } from "./types/state";
import { parseTokenString } from "./utils";
import * as Eosio from "./types/eosio";

function defaultAccount() {
    return {
        votes: {},
        staked: 0,
        proxy: "",
        is_proxy: false,
    };
}

export function defaultStats(block_num: number, currency_supply: number): Stats {
    return {
        votes: {
            total: 0,
            proxies: 0,
            accounts: 0,
        },
        accounts: {
            0: 0,
            1: 0,
            total: 0,
        },
        proxies: {
            0: 0,
            1: 0,
            total: 0,
        },
        staked: {
            0: 0,
            1: 0,
            total: 0,
        },
        vote_participation: false,
        more_yes: false,
        sustained_days: 0,
        block_num,
        currency_supply,
    };
}

export function countStaked(delband: Eosio.Delband) {
    if (!delband) return 0;
    const cpu = parseTokenString(delband.cpu_weight).amount;
    const net = parseTokenString(delband.net_weight).amount;
    return cpu + net;
}

export function filterVotersByVotes(voters: Eosio.Voters[], votes: Vote[]) {
    const results: Eosio.Voters[] = [];
    const voted = new Set();

    // Only track accounts who has casted votes
    for (const row of votes) {
        voted.add(row.voter);
    }

    for (const row of voters) {
        const owner = row.owner;

        // Voter is only included if voted or proxied to a proxy who has voted
        if (voted.has(owner) || voted.has(row.proxy)) results.push(row);
    }
    return results;
}

export function generateProxies(votes: Vote[], delband: Eosio.Delband[], voters: Eosio.Voters[]): Proxies {
    const accounts = generateAccounts(votes, delband, voters, false);
    const accountsProxies: any = generateAccounts(votes, delband, voters, true);

    for (const proxyName of Object.keys(accountsProxies)) {
        const proxy = accountsProxies[proxyName];

        for (const proposalName of Object.keys(proxy.votes)) {
            // Initialize `proxy_staked` for each proposal using self delegated EOS from proxy
            proxy.votes[proposalName].staked_proxy = Number(proxy.staked);

            for (const accountName of Object.keys(accounts)) {
                const account = accounts[accountName];

                // Check if account belongs to proxy
                if (account.proxy !== proxyName) continue;

                // Check if user has already voted for proposal
                // Do not add user `stake` if already voted for same proposal
                if (account.votes[proposalName]) continue;

                // Add user `staked` to `staked_proxy`
                accountsProxies[proxyName].votes[proposalName].staked_proxy += Number(account.staked);
            }
        }
    }

    return accountsProxies;
}

export function generateAccounts(votes: Vote[], delband: Eosio.Delband[], voters: Eosio.Voters[], proxies = false): Accounts {
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

export function generateTallies(block_num: number, proposals: Proposal[], accounts: Accounts, proxies: Accounts, currency_supply = 1000000000): Tallies {
    const tallies: Tallies = {};

    for (const proposal of proposals) {
        tallies[proposal.proposal_name] = generateTally(block_num, proposal, accounts, proxies, currency_supply);
    }
    return tallies;
}

export function generateTally(block_num: number, proposal: Proposal, accounts: Accounts, proxies: Accounts, currency_supply = 1000000000): Tally {
    const { proposal_name } = proposal;
    const stats = defaultStats(block_num, currency_supply);

    // Calculate account's staked
    for (const owner of Object.keys(accounts)) {
        const account = accounts[owner];
        const { votes } = account;
        const staked = Number(account.staked);

        if (votes[proposal_name]) {
            const { vote } = votes[proposal_name];
            // Set to 0 if undefined
            if (!stats.accounts[vote]) stats.accounts[vote] = 0;
            if (!stats.staked[vote]) stats.staked[vote] = 0;
            if (!stats.votes[vote]) stats.votes[vote] = 0;

            // Add voting weights
            stats.accounts[vote] += staked;
            stats.accounts.total += staked;
            stats.staked[vote] += staked;
            stats.staked.total += staked;

            // Voting Count
            stats.votes[vote] += 1;
            stats.votes.total += 1;
            stats.votes.accounts += 1;
        }
    }
    // Calculate proxies's staked
    // TO-DO: Create a method to support both accounts & proxies staked portion (removes 15 lines of code)
    for (const owner of Object.keys(proxies)) {
        const account = proxies[owner];
        const { votes } = account;
        const staked = Number(account.staked);

        if (votes[proposal_name]) {
            const { vote } = votes[proposal_name];
            // Set to 0 if undefined
            if (!stats.proxies[vote]) stats.proxies[vote] = 0;
            if (!stats.staked[vote]) stats.staked[vote] = 0;
            if (!stats.votes[vote]) stats.votes[vote] = 0;

            // Add voting weights
            stats.proxies[vote] += staked;
            stats.proxies.total += staked;
            stats.staked[vote] += staked;
            stats.staked.total += staked;

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
            staked += Number(account.staked);
        }

        // Set to 0 if undefined
        if (!stats.proxies[vote]) stats.proxies[vote] = 0;
        if (!stats.staked[vote]) stats.staked[vote] = 0;

        stats.proxies[vote] += staked;
        stats.proxies.total += staked;
        stats.staked[vote] += staked;
        stats.staked.total += staked;
    }

    // Vote percentages based on currenty supply
    const no_votes = stats.staked[0] || 0;
    const yes_votes = stats.staked[1] || 0;
    const total_votes = stats.staked.total || 0;

    const vote_percentages = {
        no: Number((no_votes / 10000 / currency_supply).toFixed(6)),
        yes: Number((yes_votes / 10000 / currency_supply).toFixed(6)),
        total: Number((total_votes / 10000 / currency_supply).toFixed(6)),
    };

    // No less than 15% vote participation among tokens
    stats.vote_participation = vote_percentages.total > 0.15;

    // No fewer than 10% more Yes than No votes (true/false)
    stats.more_yes = ((yes_votes - no_votes) / total_votes) >= 0.1;

    // Proposal unique ID
    // ProposalName_YYYYMMDD // awesomeprop_20181206
    const date = proposal.created_at.split("T")[0].replace(/-/g, "");
    const id = `${proposal_name}_${date}`;

    return {
        id,
        proposal,
        stats,
    };
}
