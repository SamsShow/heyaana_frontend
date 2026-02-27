const API_BASE_URL = "https://api.heyanna.trade/api/v1";

export async function fetcher(url: string) {
    const res = await fetch(url.startsWith("http") ? url : `${API_BASE_URL}${url}`);
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        error.name = await res.text();
        throw error;
    }
    return res.json();
}

export type AnalysisResponse = {
    name: string;
    description: string;
    data: any[];
    chart?: {
        type: "line" | "bar" | "area" | "stacked-area-100" | "stacked-bar-100";
        data: any[];
        xKey: string;
        yKeys: string[];
        title: string;
        yUnit?: string;
        strokeDasharrays?: (string | null)[];
        colors?: Record<string, string>;
        xLabel?: string;
        yLabel?: string;
    };
    refreshed_at: string;
};
