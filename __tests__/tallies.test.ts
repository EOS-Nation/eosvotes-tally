import path from "path";
import * as load from "load-json-file";
import { generateAccounts, generateTallies, generateProxies } from "../src/tallies";
import { Delband, VoterInfo } from "../src/types/eosio";
import { Vote, Proposal } from "../src/types/eosio.forum";

(() => {
    const block_num = 28969000;
    const proposal = "awesomemandu";

    // Load Snapshot Data
    const basedir = path.join(__dirname, "..", "test");
    const votes = load.sync<Vote[]>(path.join(basedir, "eosio.forum", "vote", `${block_num}.json`));
    const delband = load.sync<Delband[]>(path.join(basedir, "eosio", "delband", `${block_num}.json`));
    const voters = load.sync<VoterInfo[]>(path.join(basedir, "eosio", "voters", `${block_num}.json`));
    const proposals = load.sync<Proposal[]>(path.join(basedir, "eosio.forum", "proposal", `${block_num}.json`));

    // Generate Accounts & Proxies
    const accounts = generateAccounts(votes, delband, voters);
    console.log("accounts:", Object.keys(accounts).length);

    const proxies = generateProxies(votes, delband, voters);
    console.log("proxies:", Object.keys(proxies).length);

    const tallies = generateTallies(block_num, proposals, accounts, proxies);
    console.log("tallies:", Object.keys(tallies).length);

    // Report per user
    for (const username of Object.keys(accounts)) {
        const account = accounts[username];
        if (account.votes[proposal]) {
            console.log(username, account.staked);
        }
    }

    // Report per proposal
    console.log(tallies[proposal]);
})();
