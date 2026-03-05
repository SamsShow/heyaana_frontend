"use client";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { UserBadge } from "@/components/dashboard/WalletConnect";
import { useAuth } from "@/lib/useAuth";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  return (
    <DashboardChrome title="Profile">
      <div className="p-3 md:p-4">
        <div className="max-w-3xl mx-auto border border-border rounded-xl bg-surface/20 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Account Profile</h2>
            <p className="text-sm text-muted mt-1">Live session profile from authenticated user endpoint.</p>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted">Name:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.first_name ?? "—")}</span>
              </div>
              <div>
                <span className="text-muted">Username:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.username ? `@${user.username}` : "—")}</span>
              </div>
              <div>
                <span className="text-muted">Telegram ID:</span>{" "}
                <span>{isLoading ? "Loading…" : (user?.telegram_id ?? "—")}</span>
              </div>
              <div>
                <span className="text-muted">Wallet:</span>{" "}
                <span className="break-all">{isLoading ? "Loading…" : (user?.wallet_address ?? "Not connected")}</span>
              </div>
            </div>

            <UserBadge />
          </div>
        </div>
      </div>
    </DashboardChrome>
  );
}
