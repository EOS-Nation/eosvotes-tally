import { CronJob } from "cron";
import scheduler from "./src/scheduler";

// Update snapshots every 10 minutes
const cronjob = new CronJob("*/10 * * * *", async () => {
    await scheduler();
}, undefined, true, "America/Toronto");

cronjob.start();
