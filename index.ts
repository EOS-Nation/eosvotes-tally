import { CronJob } from "cron";
import scheduler from "./src/scheduler";

// Update snapshots every 5 minutes
const cronjob = new CronJob("*/5 * * * *", async () => {
    await scheduler();
}, undefined, true, "America/Toronto");

cronjob.start();
