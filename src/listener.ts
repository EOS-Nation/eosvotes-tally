import WebSocket from "ws";
import { parse_table_rows, get_table_rows } from "eosws";
import { updateVote, updateBlockNumber, updateVoter, updateProposal, updateTally, updateSelfDelegatedBandwidth, updateVoterInfo } from "./updaters";
import { DFUSE_IO_API_KEY } from "./config";
import { log } from "./utils";
import { Vote, Proposal } from "../types/eosforumrcpp";
import { Voters, Delband } from "../types/eosio";
import { state } from "./state";

/**
 * Listens to EOSIO table rows via dfuse.io WebSocket API
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

        // Listen on Self Delegated Bandwidth of all users
        for (const account_name of Object.keys(state.voters)) {
            ws.send(get_table_rows("eosio", account_name, "delband", { req_id: "eosio::delband", start_block }));
        }
    };

    ws.onmessage = async (message) => {
        const delband = parse_table_rows<Delband>(message.data, "eosio::delband");
        const voters = parse_table_rows<Voters>(message.data, "eosio::voters");
        const vote = parse_table_rows<Vote>(message.data, "eosforumrcpp::vote");
        const proposal = parse_table_rows<Proposal>(message.data, "eosforumrcpp::proposal");

        // eosio::voters
        if (voters) {
            const voter_info = voters.data.data;
            const { owner } = voter_info;

            if (state.voters[owner]) {
                log({ref: "listener::eosio::voters", message: owner});
                updateVoterInfo(owner, voter_info);
                updateBlockNumber(voters.data.block_num);
                updateTally();
            }
        }
        // eosio::delband
        if (delband) {
            const self_delegated_bandwidth = delband.data.data;
            const { from } = self_delegated_bandwidth;

            if (state.voters[from]) {
                log({ref: "listener::eosio::delband", message: from});
                updateSelfDelegatedBandwidth(from, self_delegated_bandwidth);
                updateBlockNumber(delband.data.block_num);
                updateTally();
            }
        }
        // eosforumrcpp::vote
        if (vote) {
            const { voter, proposal_name } = vote.data.data;
            log({ref: "listener::eosforumrcpp::vote", message: `${voter} voted for ${proposal_name}`});

            // Register new accounts to `delband` websocket
            if (!state.voters[voter]) {
                ws.send(get_table_rows("eosio", voter, "delband", { req_id: "eosio::delband" }));
                await updateVoter(voter);
            }
            updateVote(vote.data.data);
            updateBlockNumber(vote.data.block_num);
            updateTally();
        }
        // eosforumrcpp::proposal
        if (proposal) {
            log({ref: "listener::eosforumrcpp::proposal", message: proposal.data.data.proposal_name});
            updateProposal(proposal.data.data);
            updateTally();
            updateBlockNumber(proposal.data.block_num);
        }
    };

    ws.onclose = () => {
        log({ref: "listener", message: "connection closed"});
        listener();
    };
}
