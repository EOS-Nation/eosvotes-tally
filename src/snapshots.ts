import qs from "querystring";
import path from "path";
import fetch from "node-fetch";
import * as write from "write-json-file";
import { JSONStringifyable } from "write-json-file";
import { log } from "./utils";
import { Snapshot } from "../types/snapshot";
import { SNAPSHOT_URL } from "./config";
import { uploadS3 } from "./aws";

/**
 * Save snapshot as JSON
 */
export function saveSnapshot(json: JSONStringifyable, block_num: number, account: string, table: string, latest = false, root = "aws") {
    const baseDir = defaultBaseDir(account, table, root);

    // Snapshot folder structure
    const ref = "snapshots::saveSnapshot";
    const name = `snapshot ${account}::${table} ${block_num}`;

    // Save as JSON (Default)
    write.sync(baseDir + `${block_num}.json`, json);
    if (latest) write.sync(baseDir + "latest.json", json);
    log({ref, message: `${name} JSON saved`});

    // Upload to AWS Bucket
    uploadS3(`${account}/${table}/${block_num}.json`, json);
    if (latest) uploadS3(`${account}/${table}/latest.json`, json);
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

export function defaultBaseDir(account: string, table: string, root = "aws") {
    return path.join(__dirname, "..", root, account, table) + path.sep;
}

/**
 * Snapshot to JSON
 */
export function snapshotToJSON<T>(snapshot: Snapshot<T>): T[] {
    return snapshot.rows.map((row) => row.json);
}
