import * as load from "load-json-file";
import path from "path";
import test from "ava";
import { Tallies } from "./types/state";

function loadBlock(block_num: number, proposal = "longformtest") {
    return load.sync<Tallies>(path.join(__dirname, "tests", "snapshots", "eosvotes", "tallies", `${block_num}.json`))[proposal];
}

test("Test Case 001", async (t) => {
    const before = loadBlock(24693101);
    const after = loadBlock(24693201);

    t.is(after.stats.accounts[1] - before.stats.accounts[1], 550.2 * 10000);
});
