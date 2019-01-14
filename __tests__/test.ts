import * as load from "load-json-file";
import path from "path";
import test from "ava";
import { Proposal, Vote } from "../src/types/eosio.forum";
import { Delband, VoterInfo } from "../src/types/eosio";
import { generateAccounts, generateTallies } from "../src/tallies";

function loadBlock(block_num: number, proposal = "longformtest") {
    const basedir = path.join(__dirname, "test");
    const votes = load.sync<Vote[]>(path.join(basedir, "eosio.forum", "vote", `${block_num}.json`));
    const delband = load.sync<Delband[]>(path.join(basedir, "eosio", "delband", `${block_num}.json`));
    const voters = load.sync<VoterInfo[]>(path.join(basedir, "eosio", "voters", `${block_num}.json`));
    const proposals = load.sync<Proposal[]>(path.join(basedir, "eosio.forum", "proposal", `${block_num}.json`));

    // Generate Accounts & Proxies
    const accounts = generateAccounts(votes, delband, voters);
    const proxies = generateAccounts(votes, delband, voters, true);
    const tallies = generateTallies(block_num, proposals, accounts, proxies);

    return tallies[proposal];
}

// eosnationdan	No Proxy - 001 to 003
test("Test Case 001", async (t) => {
    const before = loadBlock(24693101);
    const after = loadBlock(24693201);

    // vote yes with 550.2 EOS
    t.is(after.stats.accounts[1] - before.stats.accounts[1], 550.2 * 10000); // yes vote
});

test("Test Case 002", async (t) => {
    const before = loadBlock(24693201);
    const after = loadBlock(24694479);

    // change vote to no with 550.2 EOS
    t.is(after.stats.accounts[0] - before.stats.accounts[0], 550.2 * 10000); // no vote
    t.is(after.stats.accounts[1] - before.stats.accounts[1], -550.2 * 10000); // yes vote
});

test("Test Case 003", async (t) => {
    const before = loadBlock(24694479);
    const after = loadBlock(24695005);

    // change stake (add 5 stake to CPU)
    t.is(after.stats.accounts[0] - before.stats.accounts[0], 5 * 10000); // no vote
});

// testymctesty	- Has Proxied via blockbuilder
// (Active, not voted) - 004 to 005
test("Test Case 004", async (t) => {
    const before = loadBlock(24695005);
    const after = loadBlock(24696082);

    // vote no with 10.2 EOS
    t.is(after.stats.accounts[0] - before.stats.accounts[0], 10.2 * 10000); // no vote
});

test("Test Case 005", async (t) => {
    const before = loadBlock(24696082);
    const after = loadBlock(24696261);

    // vote no with 10.2 EOS
    t.is(after.stats.accounts[0] - before.stats.accounts[0], -10.2 * 10000); // no vote
    t.is(after.stats.accounts[1] - before.stats.accounts[1], 10.2 * 10000); // yes vote
});

// blockbuilder	Is Proxy
test("Test Case 006", async (t) => {
    const before = loadBlock(24696261);
    const after = loadBlock(24696640);

    // vote yes with 12.2 EOS
    t.is((after.stats.proxies[1] || 0) - (before.stats.proxies[1] || 0), 12.2 * 10000); // yes vote
});

// testymctesty	Has Proxy (Active,  voted)
test("Test Case 007", async (t) => {
    const before = loadBlock(24696640);
    const after = loadBlock(24696932);

    // change vote to no 10.2 EOS
    t.is(after.stats.accounts[0] - before.stats.accounts[0], 10.2 * 10000); // no vote
    t.is(after.stats.accounts[1] - before.stats.accounts[1], -10.2 * 10000); // yes vote
});

// freedomlover	Has Proxy (unregistered)
test("Test Case 008", async (t) => {
    const before = loadBlock(24696932);
    const after = loadBlock(24697186);

    // vote yes 18.2 EOS
    t.is(after.stats.accounts[1] - before.stats.accounts[1], 18.2 * 10000); // yes vote
});

// geydknzwgqge	Has proxy set to eosnproxvote
test("Test Case 009", async (t) => {
    const before = loadBlock(24697186);
    const after = loadBlock(24697705);

    // change proxy to blockbuilder 888.2202 EOS
    t.is((after.stats.proxies[1] || 0) - (before.stats.proxies[1] || 0), 888.2202 * 10000); // yes vote
});

// geydknzwgqge	has proxy set to blockbuilder
test("Test Case 010", async (t) => {
    const before = loadBlock(24697705);
    const after = loadBlock(24698180);

    // vote yes 888.2202 EOS
    t.is(after.stats.accounts[1] - before.stats.accounts[1], 888.2202 * 10000); // yes vote
    t.is((after.stats.proxies[1] || 0) - (before.stats.proxies[1] || 0), -888.2202 * 10000); // yes vote
});

// blockbuilder	is proxy & has voted
// testymctest has assigned
test("Test Case 011", async (t) => {
    const before = loadBlock(24709229);
    const after = loadBlock(24709329);

    // unregister as proxy (12.2 EOS)
    t.is(after.stats.accounts[1] - before.stats.accounts[1], 12.2 * 10000); // yes vote
    t.is((after.stats.proxies[1] || 0) - (before.stats.proxies[1] || 0), -12.2 * 10000); // yes vote
});

// joshkauffman	No current BP vote registered
test("Test Case 012", async (t) => {
    const before = loadBlock(25368885);
    const after = loadBlock(25368886);

    // vote 1 with 28.8713 EOS
    t.is(after.stats.accounts[1] - before.stats.accounts[1], 28.8713 * 10000); // yes vote
});

// cast BP vote
test("Test Case 013", async (t) => {
    const before = loadBlock(25368886);
    const after = loadBlock(25369411);

    // no change in vote totals
    t.is(after.stats.staked[1] - before.stats.staked[1], 0 * 10000); // staked
});

test("Test Case 014", async (t) => {
    const before = loadBlock(25369411);
    const after = loadBlock(25369479);

    // change vote to no
    t.is(after.stats.accounts[0] - before.stats.accounts[0], 28.8713 * 10000); // no vote
    t.is(after.stats.accounts[1] - before.stats.accounts[1], -28.8713 * 10000); // yes vote
});

test("Test Case 015", async (t) => {
    const before = loadBlock(25369479);
    const after = loadBlock(25369651);

    // change stake (add 0.7489 stake to CPU)
    t.is(after.stats.accounts[0] - before.stats.accounts[0], 0.7489 * 10000); // no vote
});

// // testkauffman as proxy and are both voting for 0 (after this action)
// test("Test Case 017", async (t) => {
//     const before = loadBlock(25372602);
//     const after = loadBlock(25372700);

//     // proxy vote 0
//     t.is((after.stats.proxies[0] || 0) - (before.stats.proxies[0] || 0), 10.7002 * 10000); // no vote
// });

// odd numbers - awesomemandu
test("Test Case [str => number]", async (t) => {
    const current = loadBlock(28969000, "awesomemandu");
    t.is(current.stats.staked.total, 19392372546);
});

// proposal id
test("Test Case [proposal id]", async (t) => {
    const current = loadBlock(28969000, "awesomemandu");
    t.is(current.id, "awesomemandu_20181115");
});
