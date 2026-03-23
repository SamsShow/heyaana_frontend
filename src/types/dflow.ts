// ============================================================
// dFlow API Types
// ============================================================

/** Single outcome within a dFlow market */
export interface DFlowOutcome {
    title: string;
    mint: string;
    price: number; // 0–1 probability
}

/** A single dFlow prediction market */
export interface DFlowMarket {
    ticker: string;
    eventTicker: string;
    title: string;
    status: string; // "active" | "closed" | "settled"
    outcomes: DFlowOutcome[];
    volume?: number;
    liquidity?: number;
    createdAt?: string;
    closesAt?: string;
    resolvedAt?: string;
    result?: string;
}

/** A dFlow event that may contain nested markets */
export interface DFlowEvent {
    ticker: string;
    title: string;
    description?: string;
    image?: string;
    category?: string;
    tags?: string[];
    status: string;
    markets?: DFlowMarket[];
    volume?: number;
    liquidity?: number;
    createdAt?: string;
    closesAt?: string;
}

/** Response from GET /api/v1/events */
export interface EventsResponse {
    events: DFlowEvent[];
    total?: number;
}

/** Query params for events endpoint */
export interface EventsQueryParams {
    status?: string;
    seriesTickers?: string;
    limit?: number;
    category?: string;
    tags?: string;
    withNestedMarkets?: boolean;
}

/** Response from /api/v1/tags_by_categories */
export interface TagsByCategories {
    [category: string]: string[];
}

/** Response from /api/v1/series */
export interface SeriesResponse {
    series: Array<{
        ticker: string;
        title: string;
        category?: string;
        tags?: string[];
    }>;
}

/** Response from /api/v1/markets or /api/v1/markets/batch */
export interface MarketsResponse {
    markets: DFlowMarket[];
}
