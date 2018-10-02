import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// parse .env file
const envPath = path.join(__dirname, "..", ".env");
dotenv.config({path: envPath});

// EOSIO configurations
export const EOSIO_API = process.env.EOSIO_API || "http://localhost:8888";

// EOS Votes configurations
export const EOSVOTES_PORT = process.env.EOSVOTES_PORT || 3000;
export const EOSVOTES_CODE = process.env.EOSVOTES_CODE || "eosforumrcpp";

// Save .env if does not exist
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `# EOSIO
EOSIO_API=${EOSIO_API}

# EOS Votes
EOSVOTES_CODE=${EOSVOTES_CODE}
`);
}
