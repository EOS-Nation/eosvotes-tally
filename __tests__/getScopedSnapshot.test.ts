import path from "path";
import * as load from "load-json-file";
import { VoterInfo } from "../src/types/eosio";
import { config } from "../src/config";
import { getScopedSnapshot } from "../src/snapshots";
import { Vote } from "../src/types/eosio.forum";
import { Userres } from "../src/types/eosio";

(async () => {
    config();
    // Settings
    const block_num = 28969000;
    const proposal = "awesomemandu";

    // Load Snapshot Data
    const votes = load.sync<Vote[]>(path.join(__dirname, "eosio.forum", "vote", `${block_num}.json`));

    const account_names = new Set(votes.map((row) => row.voter));
    const userres = await getScopedSnapshot<Userres>("eosio", account_names, "userres", {block_num});

    console.log(userres);

})().catch((e) => console.log(e));
