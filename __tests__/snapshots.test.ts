import { config } from "../src/config";
import { getScopedSnapshot, getSnapshot, saveSnapshot, getDelbandSnapshot } from "../src/snapshots";
import { Proposal, Vote } from "../src/types/eosio.forum";
import { Userres, Voters } from "../src/types/eosio";

(async () => {
    config();
    // Settings
    const block_num = 37433000;

    // Fetch voters
    const votes = await getSnapshot<Vote>("eosio.forum", "eosio.forum", "vote", {block_num});
    const account_names = new Set(votes.map((row) => row.voter));

    // Get Snapshots
    const proposal = await getSnapshot<Proposal>("eosio.forum", "eosio.forum", "proposal", {block_num});
    const voters = await getSnapshot<Voters>("eosio", "eosio", "voters", {block_num});
    const userres = await getScopedSnapshot<Userres>("eosio", account_names, "userres", {block_num});
    const voters_names = new Set(voters.map((row) => row.owner));
    const delband = await getDelbandSnapshot(account_names, voters_names, {block_num});

    // Save Snapshots
    saveSnapshot(votes, block_num, "eosio.forum", "vote");
    saveSnapshot(proposal, block_num, "eosio.forum", "proposal");
    saveSnapshot(voters, block_num, "eosio", "voters");
    saveSnapshot(userres, block_num, "eosio", "userres");
    saveSnapshot(delband, block_num, "eosio", "delband");

})().catch((e) => console.log(e));
