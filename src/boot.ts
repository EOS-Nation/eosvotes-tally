import { getAccount, getTableRows } from "./utils";
import { Voters, Vote } from "../types";
import * as EosioTable from "eosws/types/eosio/table";

const eosjs = require("eosjs");
const encodeName = eosjs.modules.format.encodeName;

/**
 * Initial Boot to load all voters from `eosforumrcpp` vote table
 *
 * @returns {object}
 */
async function boot() {
    const { rows, more } = await getTableRows<Vote>("eosforumrcpp", "eosforumrcpp", "vote", { limit: 99999 });
    if (more) { throw new Error("implement better `getTableRows` solution ;("); }

    const voters: Voters = {};

    // for (const vote of rows) {
    //     const { voter, proposal_name } = vote;
    //     votes[voter]
    // }
}

// boot();

/**
 * Get all voters
 *
 * @param {object} [options={}] Optional parameters
 */
async function getVoters(options: {
    lower_bound?: number,
    limit?: number,
} = {}) {
    const lower_bound = options.lower_bound ? options.lower_bound : 0;
    const limit = options.limit ? options.limit : 500;
    const { rows, more } = await getTableRows<EosioTable.Voters>("eosio", "eosio", "voters", { limit, lower_bound });

    // if (limit !== rows.length && more === true) { throw new Error(`[${limit}, ${rows.length}] limit mismatch with row length`); }

    const voters: { [owner: string]: EosioTable.Voters } = {};
    let lastOwner = "";

    for (const row of rows) {
        const { owner } = row;
        voters[owner] = row;
        lastOwner = owner;
    }
    console.log("Last Owner", encodeName(lastOwner));
    if (more) {
        getVoters({lower_bound: encodeName(lastOwner) });
    }
}

getVoters();
