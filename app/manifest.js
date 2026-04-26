export default function manifest() {
  return {
    name: "ReadPulse",
    short_name: "ReadPulse",
    description: "Your personal reading companion",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#f59e0b",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}