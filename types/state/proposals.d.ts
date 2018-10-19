import { Proposal } from "../eosforumrcpp/proposal"
export { Proposal }

export interface Proposals {
    [proposal_name: string]: Proposal
}
