import WebSocket from "ws";
import { parse_table_rows, get_table_rows, generateReqId } from "eosws";
import { updateVote, updateBlockNumber } from "./updaters";
import { EOSWS_API_KEY } from "./config";
import { log } from "./utils";
import { Vote } from "../types/eosforumrcpp";

/**
 * Listen to table deltas via EOS Canada's WebSocket API
 *
 * @returns {void}
 */
export default function listener() {
    const origin = "https://api.eosvotes.io";
    const ws = new WebSocket(`wss://eosws.mainnet.eoscanada.com/v1/stream?token=${EOSWS_API_KEY}`, {origin});
    const voters_req_id = generateReqId();
    const vote_req_id = generateReqId();

    ws.onopen = () => {
        log({type: "listener", message: "connection open"});
        ws.send(get_table_rows("eosio", "eosio", "voters", {req_id: voters_req_id}));
        ws.send(get_table_rows("eosforumrcpp", "eosforumrcpp", "vote", {req_id: vote_req_id}));
    };

    ws.onmessage = (message) => {
        const voters = parse_table_rows<any>(message.data, voters_req_id);
        const vote = parse_table_rows<Vote>(message.data, vote_req_id);

        // if (voters) {
        //     log({type: "listener", message: "voters", voters});
        // }
        if (vote) {
            log({type: "listener", message: "vote", vote});
            updateVote(vote.data.row);
            updateBlockNumber(vote.data.block_num);
        }
    };

    ws.onclose = () => {
        log({type: "listener", message: "connection closed"});
        listener();
    };
}
