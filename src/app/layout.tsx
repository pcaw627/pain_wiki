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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Ensures theme is applied before React hydrates (prevents flash + keeps submit page in sync).
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='pain_wiki:theme:v1';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'};document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

