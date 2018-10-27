import { rpc } from "./config";
import { fetchSnapshot, fetchUserresSnapshot } from "./snapshots";
import { log } from "./utils";
import { Userres, Voters, Global } from "../types/eosio";
import { Vote } from "../types/eosforumrcpp";

export default async function scheduler() {
    log({ref: "scheduler", message: "activated scheduler"});

    const info = await rpc.get_info();

    // 30 minute delay from LIB & rounded to 7200 (hourly)
    const block_num = Math.round((info.last_irreversible_block_num - 3600) / 7200) * 7200;

    // eosioforumrcpp::vote
    const votes = await fetchSnapshot<Vote>(block_num, "eosforumrcpp", "eosforumrcpp", "vote");

    // eosio::voters
    const voters = await fetchSnapshot<Voters>(block_num, "eosio", "eosio", "voters");

    // eosio::global
    const global = await fetchSnapshot<Global>(block_num, "eosio", "eosio", "global");

    // eosio::userres
    if (votes) {
        const userres = await fetchUserresSnapshot(block_num, votes);
    }
}

scheduler();
