import * as fs from "fs";
import * as path from "path";
import { getScopedSnapshot, getSnapshot, saveSnapshot } from "./snapshots";
import { log, getCurrencySupply, warning } from "./utils";
import { Voters, Delband } from "../types/eosio";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { generateAccounts, generateTallies, filterVotersByVotes } from "./tallies";

export default async function scheduler(block_num: number, latest = true, root = "aws") {
    log({ref: "scheduler", message: `scheduler activated @ block number ${block_num}`});

    // Prevent re-downloading existing data
    const filepath = path.join("snapshots", "eosvotes", "tallies", `${block_num}.json`);
    if (fs.existsSync(filepath)) return warning({ref: "scheduler", message: `${filepath} already exists`});

    // Fetch voters
    const votes = await getSnapshot<Vote>({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "vote"});
    const account_names = votes.map((row) => row.voter);

    // Get Snapshots
    const proposals = await getSnapshot<Proposal>({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "proposal"});
    const delband = await getScopedSnapshot<Delband>(account_names, {block_num, account: "eosio", table: "delband"});
    const voters = filterVotersByVotes(await getSnapshot<Voters>({block_num, account: "eosio", scope: "eosio", table: "voters"}), votes);

    // Calculate Tallies
    const accounts = generateAccounts(votes, delband, voters);
    saveSnapshot(accounts, block_num, "eosvotes", "accounts", latest, root);

    const proxies = generateAccounts(votes, delband, voters, true);
    saveSnapshot(proxies, block_num, "eosvotes", "proxies", latest, root);

    const currency_supply = await getCurrencySupply();
    const tallies = generateTallies(block_num, proposals, accounts, proxies, currency_supply);
    saveSnapshot(tallies, block_num, "eosvotes", "tallies", latest, root);

    // Save Snapshots
    saveSnapshot(votes, block_num, "eosforumrcpp", "vote", latest, root);
    saveSnapshot(proposals, block_num, "eosforumrcpp", "proposal", latest, root);
    saveSnapshot(voters, block_num, "eosio", "voters", latest, root);
    saveSnapshot(delband, block_num, "eosio", "delband", latest, root);
}
