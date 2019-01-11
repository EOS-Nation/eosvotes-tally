export interface CurrencyStats {
    [symbol: string]: {
        supply:     string;
        max_supply: string;
        issuer:     string;
    }
}
