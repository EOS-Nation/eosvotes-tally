import * as fs from "fs";
import * as path from "path";
import { getDelbandSnapshot, getSnapshot, saveSnapshot } from "./snapshots";
import { log, getCurrencySupply, warning } from "./utils";
import { Voters, Delband } from "./types/eosio";
import { Vote, Proposal } from "./types/eosio.forum";
import { generateAccounts, generateTallies, filterVotersByVotes, generateProxies } from "./tallies";

export default async function scheduler(block_num: number, latest = true, root = "aws") {
    log({ref: "scheduler", message: `scheduler activated @ block number ${block_num}`});

    // Prevent re-downloading existing data
    const filepath = path.join(root, "eosvotes", "tallies", `${block_num}.json`);
    if (fs.existsSync(filepath)) return warning({ref: "scheduler", message: `${filepath} already exists`});

    // Fetch voters
    const votes = await getSnapshot<Vote>({block_num, account: "eosio.forum", scope: "eosio.forum", table: "vote"});
    const account_names = new Set(votes.map((row) => row.voter));

    // Get Snapshots
    const proposals = await getSnapshot<Proposal>({block_num, account: "eosio.forum", scope: "eosio.forum", table: "proposal"});
    const voters = filterVotersByVotes(await getSnapshot<Voters>({block_num, account: "eosio", scope: "eosio", table: "voters"}), votes);

    // Retrieve `staked` from accounts that have not yet voted for BPs
    const voters_names = new Set(voters.map((row) => row.owner));
    const delband = await getDelbandSnapshot(account_names, voters_names, {block_num, account: "eosio", table: "delband"});

    // Calculate Tallies
    const accounts = generateAccounts(votes, delband, voters);
    saveSnapshot(accounts, block_num, "eosvotes", "accounts", latest, root);

    const proxies = generateProxies(votes, delband, voters);
    saveSnapshot(proxies, block_num, "eosvotes", "proxies", latest, root);

    const currency_supply = await getCurrencySupply();
    const tallies = generateTallies(block_num, proposals, accounts, proxies, currency_supply);
    saveSnapshot(tallies, block_num, "eosvotes", "tallies", latest, root);

    // Save Snapshots
    saveSnapshot(votes, block_num, "eosio.forum", "vote", latest, root);
    saveSnapshot(proposals, block_num, "eosio.forum", "proposal", latest, root);
    saveSnapshot(voters, block_num, "eosio", "voters", latest, root);
    saveSnapshot(delband, block_num, "eosio", "delband", latest, root);
}
