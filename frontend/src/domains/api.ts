export type QueryPayload = {
    total_pages: number;
    file_path: string;
    source: string;
    text: string;
    docId: string;
};

export type QueryResponse = {
    sources: QueryResponseSource[];
    answer: string;
};

export type QueryResponseSource = {
    id: string;
    version: number;
    score: number;
    payload: QueryPayload;
    vector: unknown;
    shard_key: unknown;
    order_value: unknown;
};
