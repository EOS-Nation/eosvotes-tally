import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// parse .env file
const envPath = path.join(__dirname, "..", ".env");
dotenv.config({path: envPath});

// EOSIO configurations
export const EOSIO_API = process.env.EOSIO_API || "https://api.eosn.io";

// EOS Votes configurations
export const EOSVOTES_PORT = process.env.EOSVOTES_PORT || 3000;

// EOS Votes configurations
export const EOSWS_API_KEY = process.env.EOSWS_API_KEY;
if (!EOSWS_API_KEY) throw new Error("EOSWS_API_KEY is missing in `.env`");

// Save .env if does not exist
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `# EOSIO
EOSIO_API=${EOSIO_API}
EOSVOTES_PORT=${EOSVOTES_PORT}
EOSWS_API_KEY=
`);
}
