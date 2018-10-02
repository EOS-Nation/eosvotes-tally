interface EOSForumProposeBase {
    proposer: string
    proposal_name: string
    title: string
    expires_at: string
}

export interface EOSForumPropose extends EOSForumProposeBase {
    proposal_json: string;
}

export interface EOSForumProposeJSON extends EOSForumProposeBase  {
    proposal_json: object;
}
