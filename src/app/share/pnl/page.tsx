import type { Metadata } from "next";
import Link from "next/link";
import { getPublicSiteUrl } from "@/lib/site-url";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function searchParamsToQueryString(
  sp: Record<string, string | string[] | undefined>,
): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (val === undefined) continue;
    const s = Array.isArray(val) ? val[0] : val;
    if (s !== undefined && s !== "") q.set(key, s);
  }
  return q.toString();
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const qs = searchParamsToQueryString(sp);
  const site = getPublicSiteUrl().replace(/\/$/, "");
  const sharePath = `/share/pnl/?${qs}`;
  const imageUrl = `${site}/api/og/pnl/?${qs}`;
  const title = "PnL card · HeyAnna";

  return {
    title,
    description: "Prediction market PnL on HeyAnna",
    openGraph: {
      title,
      type: "website",
      url: `${site}${sharePath}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "HeyAnna PnL card" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Prediction market PnL on HeyAnna",
      images: [imageUrl],
    },
  };
}

export default async function SharePnLPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qs = searchParamsToQueryString(sp);
  const src = `/api/og/pnl/?${qs}`;

  return (
    <main className="min-h-screen bg-[#060B1A] flex flex-col items-center justify-center px-4 py-12 gap-6">
      <div className="w-full max-w-4xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- static OG preview */}
        <img
          src={src}
          alt="PnL card"
          width={1200}
          height={630}
          className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl"
        />
      </div>
      <p className="text-sm text-white/50 font-mono text-center max-w-md">
        Shared via{" "}
        <Link href="/" className="text-blue-primary hover:underline">
          HeyAnna
        </Link>
      </p>
    </main>
  );
}
