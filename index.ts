import { CronJob } from "cron";
import scheduler from "./src/scheduler";

// Update snapshots every 30 minutes
const cronjob = new CronJob("*/30 * * * *", async () => {
    await scheduler();
}, undefined, true, "America/Toronto");

cronjob.start();
