import { BlockInfo, Payload, State, UndelegatebwData } from "../types";
import { EOSVOTES_CODE } from "./config";
import { logInfo } from "./logging";

function logBase(state: State, payload: Payload, blockInfo: BlockInfo, context: any) {
    logInfo(`${payload.account}::${payload.name}`, blockInfo.blockNumber, JSON.stringify(payload.data));
}

function logDelegatebw(state: State, payload: Payload<UndelegatebwData>, blockInfo: BlockInfo, context: any) {
    const {from, receiver} = payload.data;
    if (state.voters[from] || state.voters[receiver]) {
        logInfo(`${payload.account}::${payload.name}`, blockInfo.blockNumber, JSON.stringify(payload.data));
    }
}

export default [
    {
        actionType: `${EOSVOTES_CODE}::propose`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::expire`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::vote`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::unvote`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::clnproposal`,
        effect: logBase,
    },
    {
        actionType: `eosio::delegatebw`,
        effect: logDelegatebw,
    },
    {
        actionType: `eosio::undelegatebw`,
        effect: logDelegatebw,
    },
];
