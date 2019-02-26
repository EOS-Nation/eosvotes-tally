import * as path from "path";
import * as nodeFetch from "node-fetch";
import dotenv from "dotenv";
import { JsonRpc } from "eosjs";
import { JsonRpc as DfuseRpc } from "dfuse-eoshttp-js";

// Typescript issues
const fetch: any = nodeFetch;

class Settings {
    public DOTENV = path.join(__dirname, "..", ".env");
    public EOSIO_API = "https://api.eosn.io";
    public DFUSE_IO_SERVER_KEY = process.env.DFUSE_IO_SERVER_KEY || "";
    public DFUSE_IO_API_KEY = process.env.DFUSE_IO_API_KEY || "";
    public DFUSE_URL = "https://mainnet.eos.dfuse.io";
    public EOSVOTES_LOGGING = "error,log,warning";
    public rpc: JsonRpc = new JsonRpc("https://api.eosn.io", { fetch });
    public dfuseRpc: DfuseRpc = new DfuseRpc(this.DFUSE_URL, { fetch, token: this.DFUSE_IO_API_KEY });
}

export const settings = new Settings();

export function config(options: {
    dotenv?: string,
    EOSIO_API?: string,
    DFUSE_IO_SERVER_KEY?: string,
    DFUSE_IO_API_KEY?: string,
    DFUSE_URL?: string,
    EOSVOTES_LOGGING?: string,
} = {}) {
    dotenv.config({path: options.dotenv || settings.DOTENV});

    // Settings
    settings.EOSIO_API = options.EOSIO_API || process.env.EOSIO_API || settings.EOSIO_API;
    settings.DFUSE_IO_SERVER_KEY = options.DFUSE_IO_SERVER_KEY || process.env.DFUSE_IO_SERVER_KEY || settings.DFUSE_IO_SERVER_KEY;
    settings.DFUSE_IO_API_KEY = options.DFUSE_IO_API_KEY || process.env.DFUSE_IO_API_KEY || settings.DFUSE_IO_API_KEY;
    settings.DFUSE_URL = options.DFUSE_URL || process.env.DFUSE_URL || settings.DFUSE_URL;
    settings.EOSVOTES_LOGGING = options.EOSVOTES_LOGGING || process.env.EOSVOTES_LOGGING || settings.EOSVOTES_LOGGING;
    settings.EOSIO_API = options.EOSIO_API || process.env.EOSIO_API || settings.EOSIO_API;

    // RPC endpoints
    settings.rpc = new JsonRpc(settings.EOSIO_API, {fetch});
    settings.dfuseRpc = new DfuseRpc(settings.DFUSE_URL, {fetch, token: settings.DFUSE_IO_API_KEY});

    return {
        EOSIO_API: settings.EOSIO_API,
        DFUSE_IO_SERVER_KEY: settings.DFUSE_IO_SERVER_KEY,
        DFUSE_URL: settings.DFUSE_URL,
        EOSVOTES_LOGGING: settings.EOSVOTES_LOGGING,
        rpc: settings.rpc,
        dfuseRpc: settings.dfuseRpc,
        DFUSE_IO_API_KEY: settings.DFUSE_IO_API_KEY,
    };
}
