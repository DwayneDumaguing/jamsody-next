// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Jamsody",
  description: "Discover musicians around you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{
        background: "#FAFAFD",   // match your page background
      }}
    >
      <body
        style={{
          margin: 0,
          background: "#FAFAFD",  // must match
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
