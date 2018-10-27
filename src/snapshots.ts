import qs from "querystring";
import path from "path";
import fetch from "node-fetch";
import * as fs from "fs";
import * as write from "write-json-file";
import { Vote } from "../types/eosforumrcpp";
import { log, warning } from "./utils";
import { Userres } from "../types/eosio";
import { Snapshot } from "../types/snapshot";

// Snapshot folder structure
const baseDir = path.join(__dirname, "..", "snapshots");

/**
 * Get Snapshot
 */
export async function getSnapshot<T>(options: {
    block_num: number,
    account: string,
    scope: string,
    table: string,
    json?: boolean,
    key_type?: string,
    with_block_num?: boolean,
}): Promise<Snapshot<T>> {
    if (options.json === undefined) { options.json = true; }
    if (options.key_type === undefined) { options.key_type = "intstr"; }
    if (options.with_block_num === undefined && options.block_num) { options.with_block_num = true; }

    const url = `http://35.203.38.11/v1/read?${qs.stringify(options)}`;
    const data = await fetch(url);
    return await data.json();
}

/**
 * Fetch eosio::userres Snapshot
 */
export async function fetchUserresSnapshot(block_num: number, votes: Snapshot<Vote>) {
    const userres: Snapshot<Userres> = {
        abi: null,
        rows: [],
    };
    for (const row of votes.rows) {
        const {voter} = row.json;
        const snapshot = await fetchSnapshot<Userres>(block_num, "eosio", voter, "userres", false);
        if (snapshot && snapshot.rows.length) userres.rows.push(snapshot.rows[0]);
    }
    return userres;
}

/**
 * Fetch Snapshot
 */
export async function fetchSnapshot<T>(block_num: number, account: string, scope: string, table: string, save = true) {
    const filepath = path.join(baseDir, account, table, `${block_num}.json`);
    const latestPath = path.join(baseDir, account, table, "latest.json");
    const ref = "snapshots::fetchSnapshot";
    const name = `snapshot ${account}::${scope}::${table} ${block_num}`;

    if (!fs.existsSync(filepath)) {
        const snapshot = await getSnapshot<T>({block_num, account, scope, table});

        // Save JSON files
        if (save) {
            write.sync(latestPath, snapshot);
            write.sync(filepath, snapshot);
            log({ref, message: `${name} created`});
        }
        return snapshot;
    } else warning({ref, message: `${name} already exists`});
}
