/**
 * Log Info
 *
 * @param {string} actionType ActionType
 * @param {number} blockNumber Block Number
 * @param {string} message Message
 * @returns {void}
 * @example
 * logInfo("eosforumdapp::propose", 50000, "eoscanadacom:havefunornot")
 */
export function logInfo(actionType: string, blockNumber: number, message: string) {
    const time = new Date().toLocaleString();
    console.info(`${time}    ${blockNumber}    ${actionType}    [INFO] ${message}`);
}

/**
 * Log Info
 *
 * @param {string} actionType ActionType
 * @param {number} blockNumber Block Number
 * @param {string} message Message
 * @returns {void}
 * @example
 * logError("eosforumdapp::vote", 50000, "tally missing proposal_key")
 */
export function logError(actionType: string, blockNumber: number, message: string) {
    const time = new Date().toLocaleString();
    console.error(`${time}    ${blockNumber}    ${actionType}    [ERROR] ${message}`);
}
