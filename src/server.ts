import express from "express";
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
        app.set("json spaces", 2);

        // Allow CORS
        app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        // Full API
        app.get("/", (req, res) => res.json(state));
        app.get("/tallies(.json)?$", (req, res) => res.json(state.tallies));
        app.get("/proposals(.json)?$", (req, res) => res.json(state.proposals));
        app.get("/votes(.json)?$", (req, res) => res.json(state.votes));
        app.get("/voters(.json)?$", (req, res) => res.json(state.voters));
        app.get("/global(.json)?$", (req, res) => res.json(state.global));

        // Scoped API
        app.get("/voter/:voter", (req, res) => res.json(state.voters[req.params.voter] || {}));
        app.get("/tallies/:proposal_name", (req, res) => res.json(state.tallies[req.params.proposal_name] || {}));

        app.listen(config.EOSVOTES_PORT, () => {
            log({ref: "server::listen", message: `api.eosvotes.io listening on port ${config.EOSVOTES_PORT}!`});
            return resolve(true);
        });
    });
}
