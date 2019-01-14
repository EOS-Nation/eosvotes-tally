import qs from "querystring";
import path from "path";
import fetch from "node-fetch";
import * as write from "write-json-file";
import { JSONStringifyable } from "write-json-file";
import { log, error } from "./utils";
import { Snapshot } from "./types/snapshot";
import { DFUSE_URL, DFUSE_IO_API_KEY } from "./config";
import { uploadS3 } from "./aws";
import { Voters, Delband } from "./types/eosio";

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
    token?: string,
}): Promise<T[]> {
    if (options.json === undefined) { options.json = true; }
    if (options.key_type === undefined) { options.key_type = "uint64"; }
    if (options.with_block_num === undefined && options.block_num) { options.with_block_num = true; }
    const token = options.token || DFUSE_IO_API_KEY;

    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const url = `${DFUSE_URL}/v0/state/table?${qs.stringify(options)}`;
    log({ref: "snapshots::getSnapshot", message: url});
    const data = await fetch(url, {headers});
    const text = await data.text();
    let json: any = [];

    try {
        json = JSON.parse(text);
    } catch (e) {
        error({ref: "snapshot::getSnapshot", message: text });
    }
    return snapshotToJSON<T>(json);
}

/**
 * Fetch Scoped Snapshot
 */
export async function getScopedSnapshot<T>(scopes: string[] | Set<string>, options: {
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

/**
 * Fetch Delband Snapshot
 */
export async function getDelbandSnapshot(account_names: Set<string>, voters_names: Set<string>, options: {
    block_num: number,
    account: string,
    table: string,
}): Promise<Delband[]> {
    const scopes: string[] = [];

    for (const name of account_names) {
        if (!voters_names.has(name)) scopes.push(name);
    }

    return getScopedSnapshot<Delband>(scopes, options);
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
