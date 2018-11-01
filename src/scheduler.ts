import { rpc } from "./config";
import { getScopedSnapshot, getSnapshot, saveSnapshot, snapshotToJSON } from "./snapshots";
import { log } from "./utils";
import { Userres, Voters, Delband } from "../types/eosio";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { generateAccounts } from "./tallies";

export default async function scheduler() {
    log({ref: "scheduler", message: "activated scheduler"});

    // Get Latest Block
    const info = await rpc.get_info();

    // 30 minute delay from LIB & rounded to 7200 (hourly)
    const block_num = Math.round((info.last_irreversible_block_num - 3600) / 7200) * 7200;

    // Fetch voters
    const vote = await getSnapshot<Vote>({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "vote"});
    const account_names = vote.map((row) => row.voter);

    // Get Snapshots
    const proposal = await getSnapshot<Proposal>({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "proposal"});
    const voters = await getSnapshot<Voters>({block_num, account: "eosio", scope: "eosio", table: "voters"});
    const userres = await getScopedSnapshot<Userres>(account_names, {block_num, account: "eosio", table: "userres"});
    const delband = await getScopedSnapshot<Delband>(account_names, {block_num, account: "eosio", table: "delband"});

    // Save Snapshots
    saveSnapshot(vote, block_num, "eosforumrcpp", "vote");
    saveSnapshot(proposal, block_num, "eosforumrcpp", "proposal");
    saveSnapshot(voters, block_num, "eosio", "voters");
    saveSnapshot(userres, block_num, "eosio", "userres");
    saveSnapshot(delband, block_num, "eosio", "delband");

    // Calculate Tallies
    const accounts = generateAccounts(vote, delband, userres, voters);
    saveSnapshot(accounts, block_num, "eosvotes", "accounts");

    const proxies = generateAccounts(vote, delband, userres, voters, true);
    saveSnapshot(accounts, block_num, "eosvotes", "accounts");
}

scheduler();
