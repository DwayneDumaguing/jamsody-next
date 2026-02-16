"use client";

import React from "react";

export default function PublicProfileActions({
  deepLink,
  loginUrl,
}: {
  deepLink: string;
  loginUrl: string;
}) {
  const share = async () => {
    const url = window.location.href;

    try {
      // @ts-ignore
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ url });
        return;
      }
    } catch (_) {}

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied ✅");
    } catch (_) {
      alert(url); // last fallback
    }
  };

  return (
    <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <a href={deepLink} style={pillOutline()}>
        🎹 Open in Jamsody
      </a>

      <a href={loginUrl} style={pillFilled()}>
        ✨ Log in
      </a>

      <button onClick={share} style={pillGhost()} title="Share">
        ⤴️
      </button>
    </div>
  );
}

function pillFilled(): React.CSSProperties {
  return {
    height: 48,
    padding: "0 18px",
    borderRadius: 16,
    background: "#2B0A3D",
    color: "white",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "none",
  };
}

function pillOutline(): React.CSSProperties {
  return {
    height: 48,
    padding: "0 18px",
    borderRadius: 16,
    background: "white",
    color: "#2B0A3D",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "1px solid rgba(43,10,61,0.18)",
  };
}

function pillGhost(): React.CSSProperties {
  return {
    height: 48,
    width: 48,
    borderRadius: 16,
    background: "white",
    border: "1px solid rgba(0,0,0,0.10)",
    fontWeight: 800,
    cursor: "pointer",
  };
}
