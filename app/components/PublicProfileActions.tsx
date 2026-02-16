"use client";

import React from "react";

export default function PublicProfileActions(props: { deepLink: string }) {
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
    <div style={styles.wrap}>
      <a href={props.deepLink} style={styles.openBtn} aria-label="Open in Jamsody">
        <JamsodyMark />
        <span style={{ fontWeight: 900 }}>Open in Jamsody</span>
      </a>

      <button onClick={share} style={styles.iconBtn} title="Share profile" aria-label="Share profile">
        <ShareIcon />
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
    fontWeight: "800",
    fontSize: "13px",
    zIndex: "9999",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  } as CSSStyleDeclaration);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 7l5-4 5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function JamsodyMark() {
  // minimalist “note” mark (no emoji)
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 20a2 2 0 1 1-4 0c0-1.1.9-2 2-2h2v2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M10 18V6.5c0-.5.34-.94.83-1.06l8-2A1.1 1.1 0 0 1 20 4.52V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 18a2 2 0 1 1-4 0c0-1.1.9-2 2-2h2v2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 16,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  openBtn: {
    flex: 1,
    height: 46,
    padding: "0 14px",
    borderRadius: 16,
    background: "#2B0A3D",
    color: "white",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    textDecoration: "none",
    boxShadow: "0 10px 28px rgba(43,10,61,0.20)",
  },
  iconBtn: {
    height: 46,
    width: 46,
    borderRadius: 16,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(17,24,39,0.12)",
    color: "#111827",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 10px 28px rgba(17,24,39,0.06)",
  },
};
