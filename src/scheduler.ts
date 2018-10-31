import { rpc } from "./config";
import { fetchScopedSnapshot, fetchSnapshot, snapshotToJSON } from "./snapshots";
import { log } from "./utils";
import { Userres, Voters, Global, Delband } from "../types/eosio";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { Snapshot } from "../types/snapshot";
import { state } from "./state";

export default async function scheduler() {
    log({ref: "scheduler", message: "activated scheduler"});

    const info = await rpc.get_info();

    // 30 minute delay from LIB & rounded to 7200 (hourly)
    const block_num = Math.round((info.last_irreversible_block_num - 3600) / 7200) * 7200;
    const options = {save: true, csv: true, overwrite: false};

    // eosioforumrcpp::vote
    const votes = await fetchSnapshot<Vote>(block_num, "eosforumrcpp", "eosforumrcpp", "vote", options);
    if (!votes) throw new Error("votes is missing");
    const account_names = votes.rows.map((row) => row.json.voter);

    // eosioforumrcpp::vote
    const proposals = await fetchSnapshot<Proposal>(block_num, "eosforumrcpp", "eosforumrcpp", "proposal", options);
    if (!proposals) throw new Error("proposals is missing");

    // eosio::voters
    const voters = await fetchSnapshot<Voters>(block_num, "eosio", "eosio", "voters", options);
    if (!voters) throw new Error("voters is missing");

    // eosio::userres
    const userres = await fetchScopedSnapshot<Userres>(block_num, "eosio", account_names, "userres", options);
    if (!userres) throw new Error("userres is missing");

    // eosio::delband
    const delband = await fetchScopedSnapshot<Delband>(block_num, "eosio", account_names, "delband", options);
    if (!delband) throw new Error("delband is missing");

    // // Update State
    // state.votes = snapshotToJSON(votes);
    // state.proposals = snapshotToJSON(proposals);

    // // Update Voter Info
    // log({ref: "scheduler", message: "updating voter info"});
    // for (const row of snapshotToJSON(voters)) {
    //     if (state.voters[row.owner]) state.voters[row.owner] = {};
    //     state.voters[row.owner].voter_info = row;
    // }
    // // Update Userres
    // log({ref: "scheduler", message: "updating userres"});
    // for (const row of snapshotToJSON(userres)) {
    //     if (state.voters[row.owner]) state.voters[row.owner] = {};
    //     state.voters[row.owner].total_resources = row;
    // }
    // // Update Delband
    // log({ref: "scheduler", message: "updating delband"});
    // // for (const row of snapshotToJSON(delband)) {
    // //     row.
    // //     if (state.voters[row.owner]) state.voters[row.owner] = {};
    // //     state.voters[row.owner].total_resources = row;
    // // }
    // state.global.block_num = block_num;

    // // Calculate Tally
    // console.log(JSON.stringify(state.voters, null, 4));
}

scheduler();
