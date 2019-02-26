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
export async function getScopedSnapshot<T>(account: string, scopes: string[] | Set<string>, table: string, options: {
    block_num: number,
}): Promise<T[]> {
    const snapshot: T[] = [];
    const block_num = options.block_num;

    // Create chunks of 1000 scopes
    const chunks: string[][] = [];
    const last = Array.from(scopes).reduce<string[]>((prev, current) => {
        prev.push(current);
        if (prev.length >= 100) {
            chunks.push(prev);
            return [];
        }
        return prev;
    }, []);
    if (last.length) chunks.push(last);

    // Iterate over each account's scope
    for (const chunk of chunks) {
        const response = await settings.dfuseRpc.state_tables_scopes<T>(account, chunk, table, {block_num, json: true});

        for (const tables of response.tables) {
            for (const row of tables.rows) {
                snapshot.push(row.json);
            }
        }
    }
    return snapshot;
}

/**
 * Fetch Delband Snapshot
 */
export async function getDelbandSnapshot(account_names: Set<string>, voters_names: Set<string>, options: {
    block_num: number,
}): Promise<Delband[]> {
    const scopes: string[] = [];

    for (const name of account_names) {
        if (!voters_names.has(name)) scopes.push(name);
    }

    return getScopedSnapshot<Delband>("eosio", scopes, "delband", options);
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
