import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";
import eosjs from "eosjs";
import dotenv from "dotenv";

// parse .env file
const envPath = path.join(__dirname, "..", ".env");
dotenv.config({path: envPath});

// EOSIO configurations
export const EOSIO_API = process.env.EOSIO_API || "https://api.eosn.io";

// dfuse.io configurations
export const DFUSE_IO_API_KEY = process.env.DFUSE_IO_API_KEY;
if (!DFUSE_IO_API_KEY) console.error("DFUSE_IO_API_KEY is missing in `.env`");

export const DFUSE_URL = process.env.DFUSE_URL;
if (!DFUSE_URL) console.error("DFUSE_URL is missing in `.env`");

// Optional Logging configs
export const EOSVOTES_LOGGING = (process.env.EOSVOTES_LOGGING || "").split(",") || ["error", "log", "warning"];

// Save .env if does not exist
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `
EOSVOTES_LOGGING="log,warning,error"
EOSIO_API=${EOSIO_API}
DFUSE_IO_API_KEY=
SNAPSHOT_URL=
`);
}

// Typescript issues
const args: any = { fetch };

// eosjs
export const rpc = new eosjs.Rpc.JsonRpc(EOSIO_API, args);
