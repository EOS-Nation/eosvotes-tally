import { Vote } from "../eosforumrcpp/vote"
export { Vote }

export interface Votes {
    [vote_id: string]: Vote
}
