import qs from "querystring";
import os from "os";
import path from "path";
import fetch from "node-fetch";
import * as fs from "fs";
import * as write from "write-json-file";
import { Vote } from "../types/eosforumrcpp";
import { log, warning } from "./utils";
import { Userres } from "../types/eosio";
import { Snapshot } from "../types/snapshot";
import * as json2csv from "json2csv";

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
        const snapshot = await fetchSnapshot<Userres>(block_num, "eosio", voter, "userres");
        if (snapshot && snapshot.rows.length) userres.rows.push(snapshot.rows[0]);
    }
    return userres;
}

/**
 * Fetch Snapshot
 */
export async function fetchSnapshot<T>(block_num: number, account: string, scope: string, table: string, options: {
    save?: boolean,
    csv?: boolean,
} = {}) {
    // Snapshot folder structure
    const baseDir = path.join(__dirname, "..", "snapshots", account, scope, table) + path.sep;
    const filepath = baseDir + `${block_num}.json`;

    // Names
    const ref = "snapshots::fetchSnapshot";
    const name = `snapshot ${account}::${scope}::${table} ${block_num}`;

    if (!fs.existsSync(filepath)) {
        const snapshot = await getSnapshot<T>({block_num, account, scope, table});
        const json = snapshot.rows.map((row) => row.json);

        // Save JSON/CSV files
        if (options.save) {
            write.sync(baseDir + "latest.json", json);
            write.sync(filepath, json);
            log({ref, message: `${name} JSON created`});

            if (options.csv) {
                const csv = json2csv.parse(json);
                fs.writeFileSync(baseDir + "latest.csv", csv);
                fs.writeFileSync(baseDir + `${block_num}.csv`, csv);
                log({ref, message: `${name} CSV created`});
            }
        }
        return snapshot;
    } else warning({ref, message: `${name} already exists`});
}
