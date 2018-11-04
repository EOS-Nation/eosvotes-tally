import { CronJob } from "cron";
import { rpc } from "./src/config";
import scheduler from "./src/scheduler";

async function latestBlock() {
    // Get Latest Block
    const info = await rpc.get_info();

    // 30 minute delay from LIB & rounded to 7200 (hourly)
    // 7200 = 60 minutes
    // 3600 = 30 minutes
    // 1200 = 10 minutes
    // 600 = 5 minutes
    const block_interval = 1200;
    const block_num = Math.round((info.last_irreversible_block_num - block_interval) / block_interval) * block_interval;
    return block_num;
}

// Update snapshots every 10 minutes
const cronjob = new CronJob("*/10 * * * *", async () => {
    await scheduler(await latestBlock());
}, undefined, true, "America/Toronto");

(async () => {
    scheduler(await latestBlock());
})();
