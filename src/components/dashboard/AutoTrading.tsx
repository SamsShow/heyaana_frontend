"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  proxyFetcher,
  formatRelativeTime,
  updateSignalTradingSettings,
  claimSignalTradingWinnings,
  type SignalTradingSettings,
  type SignalTradingJob,
} from "@/lib/api";
import {
  Loader2,
  Zap,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Settings,
  Power,
  PowerOff,
  RefreshCw,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export function AutoTrading() {
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch settings
  const {
    data: settings,
    mutate: mutateSettings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useSWR<SignalTradingSettings>(
    isAuthenticated ? "/api/proxy/me/signal-trading/settings" : null,
    proxyFetcher,
    { revalidateOnFocus: true },
  );

  // Fetch jobs
  const {
    data: jobsData,
    mutate: mutateJobs,
    isLoading: jobsLoading,
    error: jobsError,
  } = useSWR<{ jobs: SignalTradingJob[]; count: number }>(
    isAuthenticated ? "/api/proxy/me/signal-trading/jobs?limit=50" : null,
    proxyFetcher,
    { revalidateOnFocus: true, refreshInterval: 30000 },
  );

  // Auto-dismiss status messages after 5 seconds
  useEffect(() => {
    if (!statusMsg) return;
    const timer = setTimeout(() => setStatusMsg(null), 5000);
    return () => clearTimeout(timer);
  }, [statusMsg]);

  const jobs = jobsData?.jobs ?? [];
  const enabled = settings?.enabled ?? false;
  const amountUsd = settings?.amount_usd ?? 0;

  function parseError(err: unknown, fallback: string): string {
    if (!(err instanceof Error)) return fallback;
    const msg = err.message;
    if (msg.includes("timed out")) return "Request timed out — please try again";
    if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) return "Session expired — please reconnect your wallet";
    if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) return "You don't have permission to do this";
    if (msg.includes("429")) return "Too many requests — wait a moment and retry";
    if (msg.includes("500") || msg.toLowerCase().includes("internal server")) return "Server error — try again in a moment";
    if (msg.includes("non-JSON")) return "Unexpected server response — try again";
    return msg || fallback;
  }

  async function handleToggle() {
    setSaving(true);
    setStatusMsg(null);
    try {
      const newEnabled = !enabled;
      await updateSignalTradingSettings({ enabled: newEnabled, amount_usd: amountUsd });
      await mutateSettings();
      setStatusMsg({ ok: true, message: newEnabled ? "Auto-trading enabled" : "Auto-trading disabled" });
    } catch (err) {
      setStatusMsg({ ok: false, message: parseError(err, "Failed to update settings") });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAmount() {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      setStatusMsg({ ok: false, message: "Enter a valid positive amount" });
      return;
    }
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateSignalTradingSettings({ enabled, amount_usd: newAmount });
      await mutateSettings();
      setIsEditing(false);
      setStatusMsg({ ok: true, message: `Trade amount updated to $${newAmount.toFixed(2)}` });
    } catch (err) {
      setStatusMsg({ ok: false, message: parseError(err, "Failed to update amount") });
    } finally {
      setSaving(false);
    }
  }

  async function handleClaim() {
    setClaiming(true);
    setStatusMsg(null);
    try {
      const result = await claimSignalTradingWinnings();
      const msg = typeof result.result === "string" && result.result.trim()
        ? result.result.trim()
        : "Winnings claimed successfully";
      setStatusMsg({ ok: true, message: msg });
      await mutateJobs();
    } catch (err) {
      setStatusMsg({ ok: false, message: parseError(err, "Failed to claim winnings") });
    } finally {
      setClaiming(false);
    }
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-mono">Loading auto-trade settings…</span>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Failed to load settings</p>
          <p className="text-xs font-mono text-muted mt-1 max-w-xs">
            {settingsError instanceof Error ? settingsError.message : "Unable to reach the server. Check your connection."}
          </p>
        </div>
        <button
          onClick={() => mutateSettings()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/4 border border-border text-xs font-semibold hover:bg-white/7 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const successJobs = jobs.filter(j => j.status === "success" || j.status === "filled" || j.status === "executed");
  const failedJobs = jobs.filter(j => j.status === "failed" || j.status === "error");
  const pendingJobs = jobs.filter(j => j.status === "pending" || j.status === "signal");

  return (
    <div className="space-y-6">
      {/* Status message */}
      {statusMsg && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${statusMsg.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
          {statusMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{statusMsg.message}</span>
          <button
            onClick={() => setStatusMsg(null)}
            className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Settings Card */}
      <div className="dashboard-card p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-primary/15 text-blue-primary flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Auto-Trade Settings</h3>
            <p className="text-[10px] text-muted mt-0.5">Configure signal-based automatic trading</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {enabled ? (
              <Power className="w-5 h-5 text-emerald-400" />
            ) : (
              <PowerOff className="w-5 h-5 text-muted" />
            )}
            <div>
              <p className="text-sm font-semibold">{enabled ? "Active" : "Inactive"}</p>
              <p className="text-[10px] text-muted">
                {enabled ? "Signals will automatically execute trades" : "Enable to start auto-trading on signals"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
              enabled
                ? "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : enabled ? "Disable" : "Enable"}
          </button>
        </div>

        {/* Amount per trade */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-blue-primary" />
            <div>
              <p className="text-sm font-semibold">Amount per Trade</p>
              <p className="text-[10px] text-muted">USD amount for each auto-trade</p>
            </div>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">$</span>
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveAmount(); if (e.key === "Escape") setIsEditing(false); }}
                  className="w-24 pl-6 pr-2 py-1.5 rounded-lg border border-border bg-surface text-sm font-mono text-foreground focus:outline-none focus:border-blue-primary"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveAmount}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-blue-primary/15 text-blue-primary text-xs font-semibold hover:bg-blue-primary/25 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setEditAmount(String(amountUsd)); setIsEditing(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-bold font-mono hover:bg-white/[0.04] transition-all"
            >
              ${amountUsd.toFixed(2)}
              <span className="text-[10px] text-muted font-normal">Edit</span>
            </button>
          )}
        </div>

        {/* Wallet info */}
        {settings?.wallet && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-white/[0.01]">
            <div className="text-[10px] font-mono text-muted space-y-1">
              <p>Wallet: <span className="text-foreground/70">{settings.wallet.slice(0, 6)}...{settings.wallet.slice(-4)}</span></p>
              {settings.trading_wallet && (
                <p>Trading: <span className="text-foreground/70">{settings.trading_wallet.slice(0, 6)}...{settings.trading_wallet.slice(-4)}</span></p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Claim Winnings</h3>
            <p className="text-[10px] text-muted mt-0.5">Gasless claim for resolved signal trades</p>
          </div>
        </div>
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/20 text-amber-400 text-sm font-semibold hover:from-amber-500/30 hover:to-amber-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
          {claiming ? "Claiming…" : "Claim Latest Winnings"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Total Jobs</p>
          <p className="text-lg font-bold mt-1">{jobsData?.count ?? 0}</p>
        </div>
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Executed</p>
          <p className="text-lg font-bold mt-1 text-emerald-400">{successJobs.length}</p>
        </div>
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Pending</p>
          <p className="text-lg font-bold mt-1 text-amber-400">{pendingJobs.length}</p>
        </div>
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Failed</p>
          <p className="text-lg font-bold mt-1 text-red-400">{failedJobs.length}</p>
        </div>
      </div>

      {/* Signal Jobs Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-primary" />
            <span className="text-sm font-bold">Signal Jobs</span>
            <span className="text-[10px] font-mono text-muted">({jobs.length})</span>
          </div>
          <button
            onClick={() => mutateJobs()}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
            aria-label="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[1fr_100px_90px_90px_100px_90px] gap-3 px-4 py-2.5 text-[10px] font-mono text-muted uppercase tracking-wider border-b border-border/50">
          <span>Market / Signal</span>
          <span className="hidden md:block text-center">Direction</span>
          <span className="text-center">Side</span>
          <span className="text-right">Amount</span>
          <span className="text-center hidden md:block">Status</span>
          <span className="text-right">Time</span>
        </div>

        {jobsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-mono">Loading jobs…</span>
            </div>
          </div>
        ) : jobsError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <AlertCircle className="w-6 h-6 text-red-400 opacity-70" />
            <div>
              <p className="text-sm font-mono text-muted">Could not load signal jobs</p>
              <p className="text-[10px] font-mono text-muted/60 mt-0.5">
                {jobsError instanceof Error ? jobsError.message : "Fetch failed"}
              </p>
            </div>
            <button
              onClick={() => mutateJobs()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Zap className="w-6 h-6 mb-2 opacity-30" />
            <p className="text-sm font-mono">No signal jobs yet.</p>
            <p className="text-[10px] font-mono text-muted/60 mt-1">Jobs will appear here when signals are received.</p>
          </div>
        ) : (
          jobs.map((job, i) => {
            const isSuccess = job.status === "success" || job.status === "filled" || job.status === "executed";
            const isFailed = job.status === "failed" || job.status === "error";
            const isPending = job.status === "pending" || job.status === "signal";
            const isUp = (job.direction ?? "").toUpperCase() === "UP";
            const isBuy = (job.side ?? "").toLowerCase() === "buy" || (job.side ?? "").toLowerCase() === "yes";

            const rawTime = job.signal_at ?? job.executed_at ?? job.created_at;
            const timeStr = typeof rawTime === "number"
              ? new Date(rawTime * 1000).toISOString()
              : (rawTime as string | undefined);

            return (
              <div
                key={job.id ?? `${job.market_title}-${i}`}
                className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[1fr_100px_90px_90px_100px_90px] gap-3 items-center px-4 py-3 border-b border-border/30 hover:bg-surface/60 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{job.market_title ?? job.asset ?? "Signal Trade"}</p>
                  {job.tx_hash && (
                    <p className="text-[10px] font-mono text-muted/50 truncate mt-0.5">tx: {job.tx_hash.slice(0, 10)}…</p>
                  )}
                  {job.error && (
                    <p className="text-[10px] font-mono text-red-400/70 truncate mt-0.5">{job.error}</p>
                  )}
                </div>

                <div className="hidden md:flex justify-center">
                  {job.direction ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {job.direction}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted">—</span>
                  )}
                </div>

                <div className="flex justify-center">
                  {job.side ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isBuy
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {job.side}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted">—</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono">
                    {job.amount != null ? `$${Number(job.amount).toFixed(2)}` : "—"}
                  </span>
                </div>

                <div className="text-center hidden md:block">
                  {isSuccess ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {job.status}
                    </span>
                  ) : isFailed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {job.status}
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {job.status}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted">{job.status ?? "—"}</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted">
                    {timeStr ? formatRelativeTime(timeStr) : "—"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
