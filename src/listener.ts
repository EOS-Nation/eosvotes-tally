import WebSocket from "ws";
import { parse_table_rows, get_table_rows, get_actions } from "eosws";
import { updateVote, updateBlockNumber, updateVoter, updateProposal, updateTally } from "./updaters";
import { DFUSE_IO_API_KEY } from "./config";
import { log } from "./utils";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { Voters } from "../types/eosio";
import { state } from "./state";

/**
 * Listen to table deltas via EOS Canada's WebSocket API
 *
 * @returns {void}
 */
export default function listener() {
    const origin = "https://api.eosvotes.io2";
    const ws = new WebSocket(`wss://mainnet.eos.dfuse.io/v1/stream?token=${DFUSE_IO_API_KEY}`, {origin});

    ws.onopen = async () => {
        log({ref: "listener::open", message: "connection open"});
        const start_block = state.global.block_num;
        if (!start_block) throw new Error("[start_block] is required");

        ws.send(get_table_rows("eosio", "eosio", "voters", { req_id: "eosio::voters", start_block }));
        ws.send(get_table_rows("eosforumrcpp", "eosforumrcpp", "vote", { req_id: "eosforumrcpp::vote", start_block }));
        ws.send(get_table_rows("eosforumrcpp", "eosforumrcpp", "proposal", { req_id: "eosforumrcpp::proposal", start_block }));
    };

    ws.onmessage = (message) => {
        const voters = parse_table_rows<Voters>(message.data, "eosio::voters");
        const vote = parse_table_rows<Vote>(message.data, "eosforumrcpp::vote");
        const proposal = parse_table_rows<Proposal>(message.data, "eosforumrcpp::proposal");

        // eosio::voters
        if (voters) {
            const owner = voters.data.data.owner;
            if (state.voters[owner]) {
                log({ref: "listener::eosio::voters", message: voters.data.data.owner});
                updateVoter(voters.data.data.owner);
                updateBlockNumber(voters.data.block_num);
                updateTally();
            }
        }
        // eosforumrcpp::vote
        if (vote) {
            log({ref: "listener::eosforumrcpp::vote", message: vote.data.data.proposal_name});
            updateVote(vote.data.data);
            updateBlockNumber(vote.data.block_num);
            updateTally();
        }
        // eosforumrcpp::proposal
        if (proposal) {
            log({ref: "listener::eosforumrcpp::proposal", message: proposal.data.data.proposal_name});
            updateProposal(proposal.data.data);
            updateBlockNumber(proposal.data.block_num);
            updateTally();
        }
    };

    ws.onclose = () => {
        log({ref: "listener", message: "connection closed"});
        listener();
    };
}
