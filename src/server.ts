import express from "express";
import cors from "cors";
import { log } from "./utils";
import { state } from "./state";
import * as config from "./config";

/**
 * Provides HTTP endpoint of EOSVotes Tally state
 */
export default function server() {
    return new Promise((resolve, reject) => {
        // Expose State via simple HTTP express app
        const app = express();
        app.use(cors());
        app.set("json spaces", 2);

        // Main API
        app.get("/", (req, res) => res.json(state.tallies));

        // Data API
        app.get("/global(.json)?$", (req, res) => res.json(state.global));
        app.get("/tallies(.json)?$", (req, res) => res.json(state.tallies));
        app.get("/proposals(.json)?$", (req, res) => res.json(state.proposals));
        app.get("/votes(.json)?$", (req, res) => res.json(state.votes));
        app.get("/accounts(.json)?$", (req, res) => res.json(state.accounts));

        // Scoped Data API
        app.get("/accounts/:voter", (req, res) => res.json(state.accounts[req.params.voter] || {}));
        app.get("/proposals/:proposal_name", (req, res) => res.json(state.proposals[req.params.proposal_name] || {}));
        app.get("/tallies/:proposal_name", (req, res) => res.json(state.tallies[req.params.proposal_name] || {}));

        // Snapshot/Historical Data API
        app.get("/snapshots/eosio/voters/:block_number(.json)?$", (req, res) => res.json({foo: "bar"}));
        app.get("/snapshots/eosforumrcpp/voter/:block_number(.json)?$", (req, res) => res.json({foo: "bar"}));

        app.listen(config.EOSVOTES_PORT, () => {
            log({ref: "server::listen", message: `api.eosvotes.io listening on port ${config.EOSVOTES_PORT}!`});
            return resolve(true);
        });
    });
}
