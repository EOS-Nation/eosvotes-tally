export interface Snapshot<T> {
    abi:  null;
    rows: Row<T>[];
}

export interface Row<T> {
    key:   string;
    payer: string;
    json:  T;
    block: number;
}