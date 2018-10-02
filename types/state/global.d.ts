export interface Global {
  /**
   * Current EOS supply from `eosio.token`
   *
   * @default "1000000000.0000 EOS"
   */
  supply: string;
  /**
   * Total Activated Staked
   *
   * @default 3774551190700
   */
  total_activated_stake: number;
}
