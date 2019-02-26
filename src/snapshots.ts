import path from "path";
import * as write from "write-json-file";
import { JSONStringifyable } from "write-json-file";
import { log } from "./utils";
import { uploadS3 } from "./aws";
import { Delband } from "./types/eosio";
import { settings } from "./config";
import { StateResponse } from "dfuse-eoshttp-js";

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
export async function getSnapshot<T>(account: string, scope: string, table: string, options: {
    block_num: number,
}): Promise<T[]> {
    const response = await settings.dfuseRpc.state_table<T>(account, scope, table, {block_num: options.block_num, json: true});
    const message = `${account}::${scope}:${table} @ block number ${options.block_num}`;
    log({ref: "snapshots::getSnapshot", message});
    return snapshotToJSON<T>(response);
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
    const account = options.account;
    const block_num = options.block_num;
    const table = options.table;

    // Iterate over each account's scope
    for (const scope of scopes) {
        const scopedSnapshot = await getSnapshot<T>(account, scope, table, {block_num});
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
export function snapshotToJSON<T>(snapshot: StateResponse<T>): T[] {
    return snapshot.rows.map((row) => row.json);
}
