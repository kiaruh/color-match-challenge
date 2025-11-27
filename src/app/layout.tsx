import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Color Match Challenge",
  description: "Test your color perception skills in this multiplayer color matching game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
