import { CronJob } from "cron";
import server from "./src/server";
import boot from "./src/boot";
import listener from "./src/listener";
import scheduler from "./src/scheduler";
import { DFUSE_IO_API_KEY } from "./src/config";

// Initialize EOS Votes Tally
(async () => {
    await boot();
    await server();

    // Update snapshots every 30 minutes
    const cronjob = new CronJob("*/30 * * * *", async () => {
        await scheduler();
    }, undefined, true, "America/Toronto");

    if (DFUSE_IO_API_KEY) await listener();
})();
