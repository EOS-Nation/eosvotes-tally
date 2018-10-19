import Long from "long";
import chalk from "chalk";
import { EOSVOTES_LOGGING } from "./config";

/**
 * Parse Token String
 *
 * @param {string} tokenString Token String (eg: "10.0 EOS")
 * @returns {object} Amount & Symbol
 * @example
 * parseTokenString("10.0 EOS") //=> {amount: 10.0, symbol: "EOS"}
 */
export function parseTokenString(tokenString: string) {
    const [amountString, symbol] = tokenString.split(" ");
    const amount = parseFloat(amountString);
    return {amount, symbol};
}

/**
 * Create Proposal Key
 *
 * @param {object} data Data Object
 * @return {string} Proposal Key
 */
export function createProposalKey(data: {proposer: string, proposal_name: string}) {
    return `${data.proposer}:${data.proposal_name}`;
}

/**
 * Parse string to JSON
 * @param {string} str String
 * @returns {object} JSON
 * @example
 * parseJSON("{foo: 'bar'}") //=> {foo: "bar"}
 */
export function parseJSON(str: string | undefined): object {
    // Try to parse JSON
    if (str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return  {};
        }
    }
    return {};
}

/**
 * voteWeightToday computes the stake2vote weight for EOS, in order to compute the decaying value.
 */
export function voteWeightToday(): number {
    const now = Date.now();
    const secondsInAWeek = 86400 * 7;
    const weeksInAYear = 52;
    const y2k = new Date(Date.UTC(2000, 0, 1, 0, 0, 0, 0)).getTime();

    const elapsedSinceY2K = (now - y2k) / 1000;
    const weeksSinceY2K = elapsedSinceY2K / secondsInAWeek; // truncate to integer weeks
    const yearsSinceY2K = weeksSinceY2K / weeksInAYear;
    return Math.pow(yearsSinceY2K, 2);
}

export const TIMESTAMP_EPOCH = 946684800;

const charmap = ".12345abcdefghijklmnopqrstuvwxyz";
function charidx(ch: string) {
  const idx = charmap.indexOf(ch);
  if (idx === -1) {
    throw new TypeError(`Invalid character: '${ch}'`);
  }

  return idx;
}

/**
 * Calculate EOS from votes
 *
 * https://github.com/CryptoLions/EOS-Network-monitor
 *
 * @param {string} votes Votes
 * @returns {}
 */
export function calculateEosFromVotes(votes: string) {
    const date = Date.now() / 1000 - TIMESTAMP_EPOCH;
    const weight = parseInt(String(date / (86400 * 7)), 10) / 52; // 86400 = seconds per day 24*3600
    return Number(votes) / 2 ** weight / 10000;
}

/**
 * Encode a name (a base32 string) to a number.
 * For performance reasons, the blockchain uses the numerical encoding of strings
 * for very common types like account names.
 * @see types.hpp string_to_name
 * @arg {string} name - A string to encode, up to 12 characters long.
 * @return {string<uint64>} - compressed string (from name arg).  A string is
 *   always used because a number could exceed JavaScript's 52 bit limit.
 */
export function encodeName(name: string, littleEndian = true) {
    if (typeof name !== "string") {
      throw new TypeError("name parameter is a required string");
    }

    if (name.length > 12) {
      throw new TypeError("A name can be up to 12 characters long");
    }

    let bitstr = "";
    for (let i = 0; i <= 12; i++) { // process all 64 bits (even if name is short)
      const c = i < name.length ? charidx(name[i]) : 0;
      const bitlen = i < 12 ? 5 : 4;
      let bits = Number(c).toString(2);
      if (bits.length > bitlen) {
        throw new TypeError("Invalid name " + name);
      }
      bits = "0".repeat(bitlen - bits.length) + bits;
      bitstr += bits;
    }

    const value = Long.fromString(bitstr, true, 2);

    // convert to LITTLE_ENDIAN
    let leHex = "";
    const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    for (const b of bytes) {
      const n = Number(b).toString(16);
      leHex += (n.length === 1 ? "0" : "") + n;
    }

    const ulName = Long.fromString(leHex, true, 16).toString();

    return ulName.toString();
}

interface Message {
    ref: string,
    message: string
};

function formatMessage(message: Message, type: string): string {
    return `${new Date().toUTCString()}\t${type}\t${message.ref}\t${message.message}\n`;
}

export function log(message: Message) {
    if (EOSVOTES_LOGGING.indexOf("log") !== -1) process.stdout.write(formatMessage(message, "log"));
}

export function warning(message: Message) {
    if (EOSVOTES_LOGGING.indexOf("warning") !== -1) process.stdout.write(chalk.yellow(formatMessage(message, "warning")));
}

export function error(message: Message) {
    if (EOSVOTES_LOGGING.indexOf("error") !== -1) process.stderr.write(chalk.red(formatMessage(message, "error")));
}
