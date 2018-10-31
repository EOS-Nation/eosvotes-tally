import qs from "querystring";
import path from "path";
import fetch from "node-fetch";
import * as write from "write-json-file";
import { log } from "./utils";
import { Snapshot } from "../types/snapshot";
import { SNAPSHOT_URL } from "./config";

/**
 * Save snapshot as JSON
 */
export function saveSnapshot<T>(json: any, block_num: number, account: string, table: string) {
    const baseDir = defaultBaseDir(account, table);

    // Snapshot folder structure
    const ref = "snapshots::saveSnapshot";
    const name = `snapshot ${account}::${table} ${block_num}`;

    // Save as JSON (Default)
    write.sync(baseDir + "latest.json", json);
    write.sync(baseDir + `${block_num}.json`, json);
    log({ref, message: `${name} JSON saved`});
}

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
}): Promise<T[]> {
    if (options.json === undefined) { options.json = true; }
    if (options.key_type === undefined) { options.key_type = "intstr"; }
    if (options.with_block_num === undefined && options.block_num) { options.with_block_num = true; }

    const url = `${SNAPSHOT_URL}/v1/read?${qs.stringify(options)}`;
    log({ref: "snapshots::getSnapshot", message: url});
    const data = await fetch(url);
    return snapshotToJSON<T>(await data.json());
}

/**
 * Fetch Scoped Snapshot & save to JSON
 */
export async function getScopedSnapshot<T>(scopes: string[], options: {
    block_num: number,
    account: string,
    table: string,
}): Promise<T[]> {
    const snapshot: T[] = [];

    // Iterate over each account's scope
    for (const scope of scopes) {
        const scopedSnapshot = await getSnapshot<T>({block_num: options.block_num, account: options.account, scope, table: options.table});
        for (const row of scopedSnapshot) {
            snapshot.push(row);
        }
    }
    return snapshot;
}

export function defaultBaseDir(account: string, table: string) {
    return path.join(__dirname, "..", "snapshots", account, table) + path.sep;
}

/**
 * Snapshot to JSON
 */
export function snapshotToJSON<T>(snapshot: Snapshot<T>): T[] {
    return snapshot.rows.map((row) => row.json);
}
