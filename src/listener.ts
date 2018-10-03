import WebSocket from "ws";
import { get_actions, parse_actions, parse_table_deltas, get_table_deltas, generateReqId } from "eosws";

/**
 * Listen to table deltas via EOS Canada WebSocket
 *
 * @param {number} start_block Start Block
 * @returns {void}
 */
export function listener(start_block?: number) {
    const origin = "https://github.com/eos-nation/eosvotes-tally-eosws";
    const ws = new WebSocket("wss://eosws.mainnet.eoscanada.com/v1/stream", {origin});
    const voters_req_id = generateReqId();
    const voter_req_id = generateReqId();

    ws.onopen = () => {
        console.log("connection open");
        ws.send(get_table_deltas("eosio", "eosio", "voters", {req_id: voters_req_id, start_block}));
        ws.send(get_table_deltas("eosforumrcpp", "eosforumrcpp", "voter", {req_id: voter_req_id, start_block}));
    };

    ws.onmessage = (message) => {
        const voters = parse_table_deltas<any>(message.data, voters_req_id);
        const voter = parse_table_deltas<any>(message.data, voter_req_id);

        if (voters) {
            console.log(voters);
        }
        if (voter) {
            console.log(voter);
        }
    };

    ws.onclose = () => {
        console.log("connection closed");
        listener();
    };
}
