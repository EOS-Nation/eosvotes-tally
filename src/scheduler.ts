import { CronJob } from "cron";
import { updateGlobal } from "./updaters";
import { log } from "./utils";

export default function scheduler() {
    log({ref: "scheduler", message: "scheduler activated which updates [state.global]"});

    // Update globals every 5 minutes
    const cronjob = new CronJob("*/5 * * * *", async () => {
        await updateGlobal();
    }, undefined, true, "America/Toronto");
}
