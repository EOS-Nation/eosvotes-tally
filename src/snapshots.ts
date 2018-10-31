import qs from "querystring";
import path from "path";
import fetch from "node-fetch";
import * as fs from "fs-extra";
import * as write from "write-json-file";
import { Vote } from "../types/eosforumrcpp";
import { log, warning } from "./utils";
import { Userres } from "../types/eosio";
import { Snapshot } from "../types/snapshot";
import { SNAPSHOT_URL } from "./config";
import * as json2csv from "json2csv";

/**
 * Get snapshot via HTTP GET request
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

    const url = `${SNAPSHOT_URL}/v1/read?${qs.stringify(options)}`;
    log({ref: "snapshots::getSnapshot", message: url});
    const data = await fetch(url);
    return await data.json();
}

/**
 * Fetch Scoped Snapshot & save to JSON
 */
export async function fetchScopedSnapshot<T>(block_num: number, account: string, scopes: string[], table: string, options: {
    save?: boolean,
    csv?: boolean,
    overwrite?: boolean,
} = {}): Promise<Snapshot<T>> {
    const snapshot: Snapshot<T> = {
        abi: null,
        rows: [],
    };

    // Prevent re-downloading snapshot if already exists
    const filepath = defaultBaseDir(account, table) + `${block_num}.json`;
    if (options.overwrite && fs.existsSync(filepath)) {
        warning({ref: "snapshot::fetchScopedSnapshot", message: `snapshot ${account}::${table} ${block_num} already exists`});
        return snapshot;
    }

    // Iterate over each account's scope
    for (const scope of scopes) {
        const scopedSnapshot = await getSnapshot<T>({block_num, account, scope, table});
        for (const row of scopedSnapshot.rows) {
            snapshot.rows.push(row);
        }
    }
    if (options.save) saveSnapshot(snapshot, block_num, account, table, options);
    return snapshot;
}

/**
 * Save snapshot JSON/CSV files
 */
export function saveSnapshot<T>(snapshot: Snapshot<T>, block_num: number, account: string, table: string, options: {
    csv?: boolean,
    jsonl?: boolean,
} = {}) {
    const baseDir = defaultBaseDir(account, table);

    // Snapshot folder structure
    const ref = "snapshots::saveSnapshot";
    const name = `snapshot ${account}::${table} ${block_num}`;

    // Save as JSON (Default)
    const json = snapshotToJSON(snapshot);
    write.sync(baseDir + "latest.json", json);
    write.sync(baseDir + `${block_num}.json`, json);
    log({ref, message: `${name} JSON saved`});

    // Save Streaming Data as newline delimited json
    if (options.jsonl) {
        const latestStream = fs.createWriteStream(baseDir + "latest.jsonl");
        const blockNumStream = fs.createWriteStream(baseDir + `${block_num}.jsonl`);
        log({ref, message: `${name} created write streams`});

        for (const row of json) {
            const str = JSON.stringify(row);
            latestStream.write(str + "\n");
            blockNumStream.write(str + "\n");
        }
    }
}

export function defaultBaseDir(account: string, table: string) {
    return path.join(__dirname, "..", "snapshots", account, table) + path.sep;
}

/**
 * Fetch generic snapshot & save to JSON
 */
export async function fetchSnapshot<T>(block_num: number, account: string, scope: string, table: string, options: {
    save?: boolean,
    csv?: boolean,
    overwrite?: boolean,
} = {}): Promise<Snapshot<T>> {
    let snapshot: Snapshot<T> = {
        abi: null,
        rows: [],
    };

    // Prevent re-downloading snapshot if already exists
    const filepath = defaultBaseDir(account, table) + `${block_num}.json`;
    if (options.overwrite && fs.existsSync(filepath)) {
        warning({ref: "snapshot::fetchSnapshot", message: `snapshot ${account}::${table} ${block_num} already exists`});
        return snapshot;
    }

    // Get & Save snapshot
    snapshot = await getSnapshot<T>({block_num, account, scope, table});
    if (options.save) saveSnapshot(snapshot, block_num, account, table, options);
    return snapshot;
}

/**
 * Snapshot to JSON
 */
export function snapshotToJSON<T>(snapshot: Snapshot<T>): T[] {
    return snapshot.rows.map((row) => row.json);
}
