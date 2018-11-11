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
    const block_interval = 1000;
    const block_num = Math.round((info.last_irreversible_block_num - block_interval) / block_interval) * block_interval;
    return block_num;
}

async function schedule() {
    const block_num = await latestBlock();
    await scheduler(block_num);

    // Wait 1 minute before restarting
    setTimeout(() => {
        schedule();
    }, 1000 * 60);
}

schedule();
