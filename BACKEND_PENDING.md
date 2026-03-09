# Backend Pending — Features Awaiting API Implementation

This file tracks frontend features that are currently UI-only and require backend API support to become fully functional. Update this file whenever a new frontend feature is built without a backend, or when a backend endpoint is shipped and a feature can be activated.

---

## Copy Trading

### Copy Mode Settings
**Frontend:** `CopyTradeModal.tsx` — user can select copy mode, set exposure limits and slippage thresholds
**Status:** UI only — currently the "Start Copying" button calls the existing `POST /copy-trading/follow` endpoint but does NOT send any of the selected settings (copy mode, max position %, slippage %)
**Required API changes:**
- `POST /copy-trading/follow` should accept a body with:
  ```json
  {
    "leader_username": "string",
    "nickname": "string",
    "copy_mode": "match_portfolio" | "fixed_trade" | "training_wheels",
    "exposure_enabled": true,
    "max_position_pct": 25,
    "slippage_enabled": true,
    "slippage_worsen_pct": 10,
    "slippage_improve_pct": 30
  }
  ```

### "If You Copied With $100" Simulation
**Frontend:** `traders/[username]/page.tsx` — simulation card shows "—" values
**Status:** UI skeleton only
**Required API:** `GET /users/{username}/copy-simulation?amount=100` → `{ weekly_return: number, win_rate: number }`

---

## Wallet Alerts (Watch)

### Create Wallet Alert
**Frontend:** `WatchAlertModal.tsx` — user can enter name and minimum trade amount, click "Create Alert"
**Status:** UI only — the "Create Alert" button closes the modal but does NOT call any API
**Required API:**
- `POST /alerts/wallet` with body:
  ```json
  {
    "wallet_address": "string",
    "name": "string",
    "min_trade_amount": 400
  }
  ```
- `GET /alerts/wallet` — list user's wallet alerts
- `DELETE /alerts/wallet/{id}` — remove an alert

### Recommended Whales
**Frontend:** `WatchAlertModal.tsx` — "Show Recommendations" button is disabled
**Status:** UI skeleton only
**Required API:** `GET /alerts/recommended-whales` → array of whale wallet addresses with metadata

---

## Trader Profile Stats

### 30D Win Rate (on profile page)
**Frontend:** `traders/[username]/page.tsx` — shown from leaderboard query param (derived client-side from feed), not a dedicated per-trader API
**Status:** Approximate — calculated from the last 100 feed trades, not a true 30-day window
**Required API:** Include `win_rate_30d` in `GET /users/{username}/portfolio` response

### All-Time ROI (on profile page)
**Frontend:** `traders/[username]/page.tsx` — shown from leaderboard query param, derived client-side
**Status:** Approximate — calculated from feed cost vs PnL
**Required API:** Include `roi_all_time` in `GET /users/{username}/portfolio` response

### Trades/Day
**Frontend:** `traders/[username]/page.tsx` — shows "—"
**Status:** Not available
**Required API:** Include `trades_per_day` in `GET /users/{username}/portfolio` response

### Volume
**Frontend:** `traders/[username]/page.tsx` — shows "—"
**Status:** Not available
**Required API:** Include `total_volume` in `GET /users/{username}/portfolio` response

### Biggest Win
**Frontend:** `traders/[username]/page.tsx` — shows "—"
**Status:** Not available
**Required API:** Include `biggest_win` in `GET /users/{username}/portfolio` response

---

## Trader Profile — Timeframe Filtering

### 1D / 1W / 1M / ALL Tabs
**Frontend:** `traders/[username]/page.tsx` — tabs render but switching them does nothing (no data change)
**Status:** UI only
**Required API:** `GET /users/{username}/portfolio?period=1d|1w|1m|all` — portfolio and PnL scoped to the selected period

---

## Trader Profile — Activity Tab

### Trade History
**Frontend:** `traders/[username]/page.tsx` — Activity tab shows "Coming soon"
**Status:** UI skeleton only
**Required API:** `GET /users/{username}/trades?limit=50&offset=0` → paginated trade history for a specific user

---

## Top Traders Directory & Filters

### Full Trader Leaderboard Endpoint
**Frontend:** `traders/page.tsx` — leaderboard is derived client-side from the last 100 feed trades
**Status:** Approximation only — limited dataset, not a true ranked list
**Required API:** `GET /traders/leaderboard?limit=50&sort=alpha|pnl|win_rate|volume&period=weekly|monthly|all&active=true` → pre-computed trader stats with proper ranking

### Topics / Category Filter
**Frontend:** `traders/page.tsx` — "All Topics" filter pill is UI-only (no options, no filtering)
**Status:** UI only
**Required API:** `GET /traders/leaderboard?topic={slug}` — filter leaderboard by market topic/category (e.g. politics, crypto, sports). Also needs `GET /topics` to populate the dropdown options.

### Alpha Score
**Frontend:** `traders/page.tsx` — "Alpha Score" sort is a client-side composite (win rate × 0.4 + ROI × 0.3 + trade count × 0.3), not a true alpha score
**Status:** Approximation only
**Required API:** Include a server-computed `alpha_score` field in the leaderboard response

---

## Notifications / Bell

### In-App Notifications
**Frontend:** `DashboardChrome.tsx` — Bell icon in header renders with a blue dot but is a non-functional button
**Status:** UI only
**Required API:** `GET /notifications?unread=true` + WebSocket/SSE for real-time delivery

---

## Navigation Menu

### Deposit
**Frontend:** `DashboardChrome.tsx` — "Deposit" item in hamburger menu closes the menu but takes no action
**Status:** UI only
**Required API:** `POST /wallet/deposit` or redirect to a deposit flow page. Also needs `GET /wallet/deposit-address` to show a QR/address for on-chain deposit.

### Light Mode / Theme Toggle
**Frontend:** `DashboardChrome.tsx` — "Light Mode" item in hamburger menu is disabled (shows "Soon" badge)
**Status:** Frontend feature — no backend needed, but theme context/CSS variables for light mode need to be implemented in the frontend first

---

_Last updated: 2026-03-09_
