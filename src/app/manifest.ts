import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HeyAnna — The Terminal for Prediction Markets",
    short_name: "HeyAnna",
    description: "AI-powered prediction market trading terminal with real-time signals, whale tracking, and copy trading.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/heyannalogo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
