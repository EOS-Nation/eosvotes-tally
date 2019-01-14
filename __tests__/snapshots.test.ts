import { getScopedSnapshot, getSnapshot, saveSnapshot, snapshotToJSON, getDelbandSnapshot } from "../src/snapshots";
import { Proposal, Vote } from "../src/types/eosio.forum";
import { Userres, Delband, Voters } from "../src/types/eosio";

(async () => {
    // Settings
    const block_num = 37433000;

    // Fetch voters
    const votes = await getSnapshot<Vote>({block_num, account: "eosio.forum", scope: "eosio.forum", table: "vote"});
    const account_names = new Set(votes.map((row) => row.voter));

    // Get Snapshots
    const proposal = await getSnapshot<Proposal>({block_num, account: "eosio.forum", scope: "eosio.forum", table: "proposal"});
    const voters = await getSnapshot<Voters>({block_num, account: "eosio", scope: "eosio", table: "voters"});
    const userres = await getScopedSnapshot<Userres>(account_names, {block_num, account: "eosio", table: "userres"});

    const voters_names = new Set(voters.map((row) => row.owner));
    const delband = await getDelbandSnapshot(account_names, voters_names, {block_num, account: "eosio", table: "delband"});

    // Save Snapshots
    saveSnapshot(votes, block_num, "eosio.forum", "vote");
    saveSnapshot(proposal, block_num, "eosio.forum", "proposal");
    saveSnapshot(voters, block_num, "eosio", "voters");
    saveSnapshot(userres, block_num, "eosio", "userres");
    saveSnapshot(delband, block_num, "eosio", "delband");
})();
