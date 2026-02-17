// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jamsody — Find Your Rhythm",
  description:
    "Discover musicians nearby, host events, jam with friends, book one-on-one sessions, and showcase gigs — all in one place.",
  icons: {
    icon: [
      { url: "/jamsody-icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/jamsody-icon.png", type: "image/png" },
    ],
  },
  metadataBase: new URL("https://jamsody.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
