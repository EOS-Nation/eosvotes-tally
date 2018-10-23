import { CronJob } from "cron";
import path from "path";
import { log, getSnapshot } from "./utils";
import { rpc } from "./config";
import * as write from "write-json-file";

const baseDir = path.join(__dirname, "..", "snapshots");

export default function snapshots() {
    log({ref: "snapshots", message: `activated saving to [${baseDir}]`});

    // Update snapshots every 60 minutes
    const cronjob = new CronJob("*/30 * * * * *", async () => {
        const info = await rpc.get_info();
        const block_num = info.last_irreversible_block_num;

        // eosioforumrcpp::vote
        const vote = await getSnapshot({block_num, account: "eosforumrcpp", scope: "eosforumrcpp", table: "vote"});
        write.sync(path.join(baseDir, "eosforumrcpp", "vote", `latest.json`), vote);
        write.sync(path.join(baseDir, "eosforumrcpp", "vote", `${block_num}.json`), vote);

        // eosio::voter
        const voter = await getSnapshot({block_num, account: "eosio", scope: "eosio", table: "voter"});
        write.sync(path.join(baseDir, "eosio", "voter", `latest.json`), voter);
        write.sync(path.join(baseDir, "eosio", "voter", `${block_num}.json`), voter);
    }, undefined, true, "America/Toronto");
}

snapshots();
