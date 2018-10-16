import WebSocket from "ws";
import { parse_table_rows, get_table_rows, generateReqId, get_actions } from "eosws";
import { updateVote, updateBlockNumber } from "./updaters";
import { EOSWS_API_KEY } from "./config";
import { log } from "./utils";
import { Vote } from "../types/eosforumrcpp";
import { Voters } from "../types/eosio";

/**
 * Listen to table deltas via EOS Canada's WebSocket API
 *
 * @returns {void}
 */
export default function listener() {
    const origin = "https://api.eosvotes.io";
    const ws = new WebSocket(`wss://mainnet.eos.dfuse.io/v1/stream?token=${EOSWS_API_KEY}`, {origin});
    const voters_req_id = generateReqId();
    const vote_req_id = generateReqId();

    ws.onopen = () => {
        log({type: "listener", message: "connection open"});
        ws.send(get_table_rows("eosio.token", "eosio.token", "accounts", {req_id: voters_req_id, start_block: -1}));
        ws.send(get_table_rows("eosforumrcpp", "eosforumrcpp", "vote", {req_id: vote_req_id, start_block: -1}));
    };

    ws.onmessage = (message) => {
        const voters = parse_table_rows<Voters>(message.data, voters_req_id);
        const vote = parse_table_rows<Vote>(message.data, vote_req_id);

        if (voters) {
            log({type: "listener", message: voters.data});
        }
        if (vote) {
            log({type: "listener", message: vote.data.data});
            updateVote(vote.data.data);
            updateBlockNumber(vote.data.block_num);
        }
    };

    ws.onclose = () => {
        log({type: "listener", message: "connection closed"});
        listener();
    };
}
