import { settings, config } from "./src/config";
import { log } from "./src/utils";
import scheduler from "./src/scheduler";

config();
console.log(settings);

async function latestBlock() {
    // Get Latest Block
    const info = await settings.rpc.get_info();

    // 30 minute delay from LIB & rounded to 7200 (hourly)
    // 7200 = 60 minutes
    // 3600 = 30 minutes
    // 1200 = 10 minutes
    // 600 = 5 minutes
    const block_interval = 1000;
    const block_num = Math.round((info.last_irreversible_block_num - block_interval) / block_interval) * block_interval;
    return block_num;
}

async function schedule() {
    const block_num = await latestBlock();
    await scheduler(block_num)
        .catch((e) => console.error("scheduler", e));

    // Wait 1 minute before restarting
    setTimeout(() => {
        schedule();
    }, 1000 * 60);
}

async function reloadDfuseAPI() {
    const {token} = await settings.dfuseRpc.auth_issue(settings.DFUSE_IO_SERVER_KEY);
    settings.DFUSE_IO_API_KEY = token;
    log({ref: "main::reloadDfuseAPI", message: `dfuse API token    ${token}`});

    // Wait 12 hours before restarting
    setTimeout(() => {
        reloadDfuseAPI();
    }, 1000 * 60 * 60 * 12);
}

(async () => {
    await reloadDfuseAPI().catch((e) => console.error("main", e));
    await schedule().catch((e) => console.error("main", e));
})();
