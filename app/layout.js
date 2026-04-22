import "./globals.css";

export const metadata = {
  title: "ReadPulse",
  description: "Your personal reading companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}