import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pain Wiki",
  description: "A community wisdom map for students, alumni, and faculty."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

