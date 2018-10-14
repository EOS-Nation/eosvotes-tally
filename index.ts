import server from "./src/server";
import boot from "./src/boot";
import listener from "./src/listener";

// Initialize EOS Votes Tally
(async () => {
    await boot();
    await server();
    await listener();
})();
