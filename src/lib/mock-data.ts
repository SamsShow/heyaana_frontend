// Mock data used by onboarding flow

export const topTraders = [
  { id: 1, name: "AlphaTrader_92", avatar: "AT", winRate: 87.3, pnl: "+$24,580", trades: 342, streak: 12, markets: ["Politics", "Crypto"] },
  { id: 2, name: "PredictorX", avatar: "PX", winRate: 82.1, pnl: "+$18,240", trades: 218, streak: 8, markets: ["Economics", "Weather"] },
  { id: 3, name: "MarketSeer", avatar: "MS", winRate: 79.8, pnl: "+$15,920", trades: 456, streak: 5, markets: ["Sports", "Politics"] },
  { id: 4, name: "OracleBot_v3", avatar: "OB", winRate: 76.5, pnl: "+$12,340", trades: 189, streak: 3, markets: ["Crypto", "Tech"] },
  { id: 5, name: "SharpEdge", avatar: "SE", winRate: 74.2, pnl: "+$9,870", trades: 527, streak: 7, markets: ["Finance", "Politics"] },
];

export const marketCategories = [
  { name: "Politics", icon: "🏛️", count: 234, hot: true },
  { name: "Crypto", icon: "₿", count: 189, hot: true },
  { name: "Economics", icon: "📊", count: 156, hot: false },
  { name: "Sports", icon: "⚽", count: 312, hot: false },
  { name: "Weather", icon: "🌤️", count: 87, hot: false },
  { name: "Tech", icon: "💻", count: 143, hot: true },
  { name: "Entertainment", icon: "🎬", count: 98, hot: false },
  { name: "Science", icon: "🔬", count: 67, hot: false },
];
