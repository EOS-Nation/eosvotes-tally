import axios from "axios";
import { EOSForumProposeJSON, EOSForumTableProposal, GetAccount, GetTableRows, CurrencyStats } from "../types";
import * as config from "./config";

/**
 * Parse Token String
 *
 * @param {string} tokenString Token String (eg: "10.0 EOS")
 * @returns {object} Amount & Symbol
 * @example
 * parseTokenString("10.0 EOS") //=> {amount: 10.0, symbol: "EOS"}
 */
export function parseTokenString(tokenString: string) {
    const [amountString, symbol] = tokenString.split(" ");
    const amount = parseFloat(amountString);
    return {amount, symbol};
}

/**
 * Create Proposal Key
 *
 * @param {object} data Data Object
 * @return {string} Proposal Key
 */
export function createProposalKey(data: {proposer: string, proposal_name: string}) {
    return `${data.proposer}:${data.proposal_name}`;
}

/**
 * Parse string to JSON
 * @param {string} str String
 * @returns {object} JSON
 * @example
 * parseJSON("{foo: 'bar'}") //=> {foo: "bar"}
 */
export function parseJSON(str: string | undefined): object {
    // Try to parse JSON
    if (str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return  {};
        }
    }
    return {};
}

/**
 * Get Account
 */
export async function getAccount(account_name: string, maxRetries = 5): Promise<GetAccount | null> {
    const url = config.EOSIO_API + "/v1/chain/get_account";
    try {
        const {data} = await axios.post<GetAccount>(url, {account_name});
        return data;
    } catch (e) {
        console.error(e);
        if (maxRetries > 0) {
            return await getAccount(account_name, maxRetries - 1);
        }
        return null;
    }
}

/**
 * Get Table Rows
 *
 * @param {string} code Provide the smart contract name
 * @param {string} scope Provide the account name
 * @param {string} table Provide the table name
 * @param {object} [options={}] Optional parameters
 * @param {number} [options.lower_bound] Provide the lower bound
 * @param {number} [options.upper_bound] Provide the upper bound
 * @param {number} [options.limit] Provide the limit
 * @returns {object} Table Rows
 */
export async function getTableRows<T = any>(code: string, scope: string, table: string, options: {
    lower_bound?: number,
    upper_bound?: number,
    limit?: number,
} = {}) {
    const url = config.EOSIO_API + "/v1/chain/get_table_rows";
    const params: any = {code, scope, table, json: true};

    // optional parameters
    if (options.lower_bound) { params.lower_bound = params.lower_bound; }
    if (options.upper_bound) { params.upper_bound = params.upper_bound; }
    if (options.limit) { params.limit = options.limit; }

    try {
        const {data} = await axios.post<GetTableRows<T>>(url, params);
        return data;
    } catch (e) {
        throw new Error(e);
    }
}

/**
 * Get `eosio.forum` Proposal
 * @example
 * const proposal = await getProposal("eosforumdap", "eostribeprod")
 */
export async function getProposal(code: string, proposal_name: string): Promise<EOSForumProposeJSON|null> {
    // TO-DO handle greater then 50 proposals
    console.log("TO-DO Implement better `getProposal`");
    const limit = 50;
    while (true) {
        const table = await getTableRows<EOSForumTableProposal>(code, code, "proposal", {limit});
        for (const row of table.rows) {
            // Match exact proposal_name
            if (row.proposal_name === proposal_name) {
                return {
                    proposer: row.proposer,
                    proposal_name: row.proposal_name,
                    title: row.title,
                    expires_at: row.expires_at,
                    proposal_json: parseJSON(row.proposal_json),
                };
            }
        }
        // End of Table
        if (table.more === false) { break; }
    }
    return null;
}

/**
 * Get Currency Stats
 * @example
 *
 * const stats = await getCurrencyStats("eosio.token", "EOS");
 * { EOS:
 *   {
 *     supply: '1010557418.3311 EOS',
 *     max_supply: '10000000000.0000 EOS',
 *     issuer: 'eosio'
 *   }
 *  }
 */
export async function getCurrencyStats(code: string, symbol = "EOS") {
    const url = config.EOSIO_API + "/v1/chain/get_currency_stats";
    const params = {code, symbol};

    const {data} = await axios.post<CurrencyStats>(url, params);
    return data;
}

/**
 * voteWeightToday computes the stake2vote weight for EOS, in order to compute the decaying value.
 */
export function voteWeightToday(): number {
    const now = Date.now();
    const secondsInAWeek = 86400 * 7;
    const weeksInAYear = 52;
    const y2k = new Date(Date.UTC(2000, 0, 1, 0, 0, 0, 0)).getTime();

    const elapsedSinceY2K = (now - y2k) / 1000;
    const weeksSinceY2K = elapsedSinceY2K / secondsInAWeek; // truncate to integer weeks
    const yearsSinceY2K = weeksSinceY2K / weeksInAYear;
    return Math.pow(yearsSinceY2K, 2);
}

// (async () => {
//     const stats = await getCurrencyStats("eosio.token", "EOS");
//     console.log(stats);
// })();
