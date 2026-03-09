// Fallback when APIs are unavailable — blank values (no mock data)

export const mockDashboardSummary: Record<string, unknown> = {
  total_trades: null,
  total_volume: null,
  overall_win_rate: null,
  avg_excess_return: null,
  unique_markets: null,
};

// Empty — no mock data; UI shows "Coming soon"

export const topTraders: Array<{
  id: number;
  username: string;
  name: string;
  avatar: string;
  winRate: number;
  pnl: string;
  trades: number;
  streak: number;
  markets: string[];
}> = [];

export const marketCategories: Array<{
  name: string;
  icon: string;
  count: number;
  hot: boolean;
}> = [];
