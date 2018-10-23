import server from "./src/server";
import boot from "./src/boot";
import listener from "./src/listener";
import scheduler from "./src/scheduler";
import snapshots from "./src/snapshots";
import { DFUSE_IO_API_KEY } from "./src/config";

// Initialize EOS Votes Tally
(async () => {
    await boot();
    await server();
    await scheduler();
    await snapshots();
    if (DFUSE_IO_API_KEY) await listener();
})();
