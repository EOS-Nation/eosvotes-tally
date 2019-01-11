import { getScopedSnapshot, getSnapshot, saveSnapshot, snapshotToJSON } from "./snapshots";
import { Proposal, Vote } from "./types/eosforumrcpp";
import { Userres, Delband, Voters } from "./types/eosio";

(async () => {
    // Settings
    const block_num = 24544800;

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
})();
