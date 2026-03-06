"use client";

import { AppKitButton, AppKitProvider } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum, base, mainnet, polygon } from "@reown/appkit/networks";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

if (walletConnectProjectId === "demo-project-id" && typeof window !== "undefined") {
  console.warn("WalletConnect Project ID is missing. Using demo-project-id. Get one at https://cloud.walletconnect.com");
}

const metadata = {
  name: "HeyAnna",
  description: "Prediction market terminal",
  url: "https://heyanna.trade",
  icons: ["https://heyanna.trade/heyannalogo.png"],
};

const networks = [mainnet, polygon, arbitrum, base] as const;

const wagmiAdapter = new WagmiAdapter({
  projectId: walletConnectProjectId,
  networks: [...networks],
});

export const hasWalletConnectProjectId = Boolean(
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
);

export function WalletConnectKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppKitProvider
      adapters={[wagmiAdapter]}
      projectId={walletConnectProjectId}
      networks={[...networks]}
      defaultNetwork={base}
      metadata={metadata}
    >
      {children}
    </AppKitProvider>
  );
}

export function WalletConnectKitButton() {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1.5">
      <AppKitButton />
    </div>
  );
}
