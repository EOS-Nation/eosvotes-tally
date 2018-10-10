import express from "express";
import { state } from "./src/state";
import * as config from "./src/config";

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
app.get("/proposals(.json)?$", (req, res) => res.json(state.proposals));
app.get("/votes(.json)?$", (req, res) => res.json(state.votes));
app.get("/voters(.json)?$", (req, res) => res.json(state.voters));
app.get("/global(.json)?$", (req, res) => res.json(state.global));

// Scoped API
app.get("/voter/:voter", (req, res) => res.json(state.voters[req.params.voter] || {}));
app.get("/proposal/:proposal_name", (req, res) => {
    const { proposal_name } = req.params;
    if (state.proposals[proposal_name]) res.json(state.proposals[proposal_name]);
    else res.json({});
});

app.listen(config.EOSVOTES_PORT, () => console.log(`EOS Votes listening on port ${config.EOSVOTES_PORT}!`));
