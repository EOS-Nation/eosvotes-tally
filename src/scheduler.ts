import { rpc } from "./config";
import { getScopedSnapshot, getSnapshot, saveSnapshot } from "./snapshots";
import { log, getCurrencySupply } from "./utils";
import { Voters, Delband } from "../types/eosio";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { generateAccounts, generateTallies, filterVotersByVotes } from "./tallies";

export default async function scheduler() {
    log({ref: "scheduler", message: "activated scheduler"});

    // Get Latest Block
    const info = await rpc.get_info();
    const currency_supply = await getCurrencySupply();

    // 30 minute delay from LIB & rounded to 7200 (hourly)
    const block_num = Math.round((info.last_irreversible_block_num - 3600) / 7200) * 7200;

    // Fetch voters
    const votes = await getSnapshot<Vote>({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "vote"});
    const account_names = votes.map((row) => row.voter);

    // Get Snapshots
    const proposals = await getSnapshot<Proposal>({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "proposal"});
    const delband = await getScopedSnapshot<Delband>(account_names, {block_num, account: "eosio", table: "delband"});
    const voters = filterVotersByVotes(await getSnapshot<Voters>({block_num, account: "eosio", scope: "eosio", table: "voters"}), votes);

    // Calculate Tallies
    const accounts = generateAccounts(votes, delband, voters);
    saveSnapshot(accounts, block_num, "eosvotes", "accounts");

    const proxies = generateAccounts(votes, delband, voters, true);
    saveSnapshot(proxies, block_num, "eosvotes", "proxies");

    const tallies = generateTallies(proposals, accounts, proxies, currency_supply);
    saveSnapshot(tallies, block_num, "eosvotes", "tallies");

    // Save Snapshots
    saveSnapshot(votes, block_num, "eosforumrcpp", "vote");
    saveSnapshot(proposals, block_num, "eosforumrcpp", "proposal");
    saveSnapshot(voters, block_num, "eosio", "voters");
    saveSnapshot(delband, block_num, "eosio", "delband");
}

scheduler();
