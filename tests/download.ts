import scheduler from "../src/scheduler";

const block_nums = [
    24693101,
    24693201,
    24694479,
    24695005,
    24696082,
    24696261,
    24696640,
    24696932,
    24697186,
    24697705,
    24698180,
    24709329,
];

(async () => {
    for (const block_num of block_nums) {
        await scheduler(block_num);
    }
})();
