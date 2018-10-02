interface EOSForumVoteBase {
    voter:         string;
    proposal_name: string;
    vote:          number;
}

export interface EOSForumVote extends EOSForumVoteBase {
    vote_json: string;
}

export interface EOSForumVoteJSON extends EOSForumVoteBase {
    vote_json: object;
}
