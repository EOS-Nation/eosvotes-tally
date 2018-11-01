import path from "path";
import * as load from "load-json-file";
import { generateAccounts, generateTallies } from "./tallies";
import { saveSnapshot } from "./snapshots";
import { Userres, Delband, VoterInfo } from "../types/eosio";
import { Vote, Proposal } from "../types/eosforumrcpp";

(() => {
    const block_num = 24523200;

    // Load Snapshot Data
    const basedir = path.join(__dirname, "..", "snapshots");
    const votes = load.sync<Vote[]>(path.join(basedir, "eosforumrcpp", "vote", "latest.json"));
    const delband = load.sync<Delband[]>(path.join(basedir, "eosio", "delband", "latest.json"));
    const userres = load.sync<Userres[]>(path.join(basedir, "eosio", "userres", "latest.json"));
    const voters = load.sync<VoterInfo[]>(path.join(basedir, "eosio", "voters", "latest.json"));
    const proposals = load.sync<Proposal[]>(path.join(basedir, "eosforumrcpp", "proposal", "latest.json"));

    // Generate Accounts & Proxies
    const accounts = generateAccounts(votes, delband, userres, voters);
    saveSnapshot(accounts, block_num, "eosvotes", "accounts");
    console.log("accounts:", Object.keys(accounts).length);

    const proxies = generateAccounts(votes, delband, userres, voters, true);
    saveSnapshot(proxies, block_num, "eosvotes", "proxies");
    console.log("proxies:", Object.keys(proxies).length);

    const tallies = generateTallies(proposals, accounts, proxies);
    saveSnapshot(tallies, block_num, "eosvotes", "tallies");
    console.log("tallies:", Object.keys(tallies).length);
})();
