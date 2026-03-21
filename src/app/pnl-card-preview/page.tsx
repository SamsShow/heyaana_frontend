/**
 * Dev/design helper: renders the live OG image output at a comfortable size.
 * Open: /pnl-card-preview (with `npm run dev`).
 */
export default function PnlCardPreviewPage() {
  const sample = new URLSearchParams({
    market: "Bitcoin Up or Down - 5 Minutes",
    pnl: "98765432",
    pnlCash: "+$98,765,432",
    pnlPct: "142.5",
    entry: "$1234",
    exit: "$1234",
    date: "Mar 20, 2026",
    status: "Yes",
  });

  const src = `/api/og/pnl?${sample.toString()}`;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center space-y-1 max-w-xl">
        <h1 className="text-zinc-100 text-lg font-semibold">PnL share card preview</h1>
        <p className="text-zinc-500 text-sm">
          This is the real PNG from{" "}
          <code className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-xs">
            GET /api/og/pnl
          </code>{" "}
          with sample query params (same layout as Share card).
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- preview of dynamic OG route */}
      <img
        src={src}
        alt="Sample PnL share card"
        width={1200}
        height={630}
        className="w-full max-w-5xl h-auto rounded-xl border border-white/10 shadow-2xl"
      />
      <p className="text-zinc-600 text-xs font-mono break-all max-w-4xl text-center">
        {src}
      </p>
    </div>
  );
}
