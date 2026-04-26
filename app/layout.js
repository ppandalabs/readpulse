import "./globals.css";
import AuthGuard from "./AuthGuard";

export const metadata = {
  title: "ReadPulse",
  description: "Your personal reading companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}