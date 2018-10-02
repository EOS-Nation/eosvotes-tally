interface EOSForumPostBase {
    poster:             string;
    post_uuid:          string;
    content:            string;
    reply_to_poster:    string;
    reply_to_post_uuid: string;
    certify:            boolean;
}

export interface EOSForumPost extends EOSForumPostBase {
    json_metadata: string;
}

export interface EOSForumPostJSON extends EOSForumPostBase {
    json_metadata: object;
}
