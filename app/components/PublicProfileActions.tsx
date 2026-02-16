"use client";

import React from "react";

export default function PublicProfileActions() {
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
      toast("Link copied ✅");
    } catch (_) {
      alert(url);
    }
  };

  return (
    <div style={styles.row}>
      <button onClick={share} style={styles.shareBtn} title="Share profile">
        <span style={{ fontSize: 16 }}>⤴️</span>
        <span style={{ fontWeight: 800 }}>Share</span>
      </button>
    </div>
  );
}

function toast(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed",
    left: "50%",
    bottom: "22px",
    transform: "translateX(-50%)",
    background: "rgba(17,24,39,0.92)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "13px",
    zIndex: "9999",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  } as CSSStyleDeclaration);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    marginTop: 14,
    display: "flex",
    justifyContent: "center",
  },
  shareBtn: {
    height: 44,
    padding: "0 14px",
    borderRadius: 16,
    background: "white",
    border: "1px solid rgba(0,0,0,0.10)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
};
