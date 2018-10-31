import path from "path";
import * as load from "load-json-file";
import { generateAccounts } from "./tallies";
import { saveSnapshot } from "./snapshots";
import { Userres, Delband, VoterInfo } from "../types/eosio";
import { Vote, Proposal } from "../types/eosforumrcpp";

(() => {
    // Load Snapshot Data
    const basedir = path.join(__dirname, "..", "snapshots");
    const votes = load.sync<Vote[]>(path.join(basedir, "eosforumrcpp", "vote", "latest.json"));
    const delband = load.sync<Delband[]>(path.join(basedir, "eosio", "delband", "latest.json"));
    const userres = load.sync<Userres[]>(path.join(basedir, "eosio", "userres", "latest.json"));
    const voters = load.sync<VoterInfo[]>(path.join(basedir, "eosio", "voters", "latest.json"));
    const proposals = load.sync<Proposal[]>(path.join(basedir, "eosforumrcpp", "proposal", "latest.json"));

    // Calculate Tallies
    const accounts = generateAccounts(votes, delband, userres, voters);
    saveSnapshot(accounts, 24523200, "eosvotes", "accounts");
})();
