import AWS from "aws-sdk";
import { log, error } from "./utils";
import { JSONStringifyable } from "write-json-file";

export function uploadS3(filepath: string, data: JSONStringifyable) {
    const s3 = new AWS.S3();
    const Bucket = "api.eosvotes.io";
    const Key = filepath;

    const params = {
        Bucket,
        Key,
        Body: JSON.stringify(data, null, 4),
        ACL: "public-read",
        ContentType: "JSON",
    };

    s3.putObject(params, (err) => {
        if (err) error({ref: "uploadS3", message: err.message});
        else log({ref: "aws::uploadS3", message: `uploaded s3://${Bucket}/${Key}`});
    });
}
