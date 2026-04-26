import "./globals.css";
import AuthGuard from "./AuthGuard";

export const metadata = {
  title: "ReadPulse",
  description: "Your personal reading companion",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReadPulse",
  },
};

export const viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ReadPulse" />
      </head>
      <body className="bg-gray-950 text-white min-h-screen">
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}