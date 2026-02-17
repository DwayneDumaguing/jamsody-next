// app/page.tsx
import React from "react";

const MAX_W = 1040;
const CARD_RADIUS = 26;

const ORANGE_1 = "#FF8A00";
const ORANGE_2 = "#FFB347";
const PURPLE_1 = "#5B2BFF";
const DEEP_PURPLE = "#2B0A3D";

const APP_STORE_URL = "#"; // TODO: put your real App Store link here
const PLAY_STORE_URL: string | null = null; // keep null for "Coming soon"

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `
            radial-gradient(900px 500px at 20% 0%, rgba(91,43,255,0.18), transparent 55%),
            radial-gradient(900px 500px at 80% 10%, rgba(255,138,0,0.22), transparent 55%),
            linear-gradient(180deg, rgba(255,179,71,0.22), rgba(250,250,253,1) 55%)
          `,
          zIndex: -1,
        }}
      />

      {/* Top bar */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "18px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "#0F172A",
              fontWeight: 950,
              letterSpacing: -0.2,
            }}
          >
            <div style={logoDot()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/jamsody.png"
                alt="Jamsody"
                width={26}
                height={26}
                style={{ width: 26, height: 26, objectFit: "contain" }}
              />
            </div>
            <span style={{ fontSize: 16 }}>Jamsody</span>
          </a>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="#download" style={ghostBtn()}>
              Download
            </a>
            <a href="jamsody://home" style={solidBtn()}>
              Open app
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "10px 16px 56px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 18,
            alignItems: "stretch",
          }}
          className="jamsody-grid"
        >
          {/* Left: Hero */}
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={pill()}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <SparkIcon />
                  Music meets community
                </span>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 52,
                  lineHeight: 1.03,
                  fontWeight: 1000,
                  letterSpacing: -1.4,
                  color: "#0F172A",
                }}
              >
                Find Your Rhythm
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "rgba(15,23,42,0.78)",
                  maxWidth: 560,
                }}
              >
                Discover musicians nearby, connect faster, and organise jams, one-on-one sessions, and public gigs — all
                in one place.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                <MiniStat icon={<MapPinMini />} title="Discover" desc="Musicians around you" />
                <MiniStat icon={<ChatMini />} title="Connect" desc="Chat & invite quickly" />
                <MiniStat icon={<CalendarMini />} title="Organise" desc="Sessions & gigs" />
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(15,23,42,0.55)" }}>
                Tip: Open shared links in Safari → tap <b>Open in Jamsody</b> to jump into the right page.
              </div>
            </div>
          </Card>

          {/* Right: Logo + Download */}
          <Card>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 12px" }}>
                <div style={logoHeroWrap()}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/jamsody.png"
                    alt="Jamsody logo"
                    style={{ width: "72%", height: "72%", objectFit: "contain" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 2, textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 950, color: "#0F172A" }}>Download Jamsody</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "rgba(15,23,42,0.70)", lineHeight: 1.45 }}>
                  Start discovering and jamming today.
                </div>
              </div>

              <div id="download" style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <a href={APP_STORE_URL} style={storeBtn()}>
                  <AppleIcon />
                  <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontSize: 11, opacity: 0.82, fontWeight: 850 }}>Download on the</div>
                    <div style={{ fontSize: 15, fontWeight: 1000 }}>App Store</div>
                  </div>
                  <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                    <ArrowIcon />
                  </span>
                </a>

                <a
                  href={PLAY_STORE_URL ?? "#"}
                  style={{
                    ...storeBtn(),
                    opacity: PLAY_STORE_URL ? 1 : 0.55,
                    pointerEvents: PLAY_STORE_URL ? "auto" : "none",
                  }}
                >
                  <PlayIcon />
                  <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontSize: 11, opacity: 0.82, fontWeight: 850 }}>Android</div>
                    <div style={{ fontSize: 15, fontWeight: 1000 }}>Coming soon</div>
                  </div>
                </a>

                <a href="jamsody://home" style={openBtn()}>
                  Open in Jamsody
                </a>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ marginTop: 18, fontSize: 12, opacity: 0.55, textAlign: "center" }}>
                Powered by <b>Jamsody</b>
              </div>
            </div>
          </Card>
        </div>

        {/* Responsive */}
        <style>{`
          @media (max-width: 900px) {
            .jamsody-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  );
}

/* ---------- UI bits ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        borderRadius: CARD_RADIUS,
        border: "1px solid rgba(15,23,42,0.10)",
        boxShadow: "0 18px 50px rgba(15,23,42,0.10)",
        padding: 22,
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function pill(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    background: "rgba(91,43,255,0.10)",
    border: "1px solid rgba(91,43,255,0.20)",
    color: DEEP_PURPLE,
    width: "fit-content",
  };
}

function logoDot(): React.CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: 14,
    background:
      "linear-gradient(135deg, rgba(255,138,0,0.25), rgba(91,43,255,0.18))",
    border: "1px solid rgba(15,23,42,0.10)",
    display: "grid",
    placeItems: "center",
  };
}

function logoHeroWrap(): React.CSSProperties {
  return {
    width: 220,
    height: 220,
    borderRadius: 32,
    background: `linear-gradient(180deg, ${ORANGE_1}, ${ORANGE_2})`,
    display: "grid",
    placeItems: "center",
    boxShadow: "0 22px 60px rgba(255,138,0,0.28)",
    border: "1px solid rgba(15,23,42,0.10)",
    overflow: "hidden",
  };
}

function solidBtn(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: DEEP_PURPLE,
    color: "white",
    fontWeight: 950,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 12px 30px rgba(43,10,61,0.18)",
  };
}

function ghostBtn(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(15,23,42,0.10)",
    color: "#111827",
    fontWeight: 950,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };
}

function storeBtn(): React.CSSProperties {
  return {
    height: 58,
    padding: "0 14px",
    borderRadius: 18,
    background:
      "linear-gradient(90deg, rgba(255,138,0,0.14), rgba(91,43,255,0.10))",
    border: "1px solid rgba(15,23,42,0.10)",
    color: "#0F172A",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
  };
}

function openBtn(): React.CSSProperties {
  return {
    height: 46,
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.88)",
    color: "#111827",
    fontWeight: 950,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  };
}

function MiniStat({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 170px",
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.08)",
        background: "rgba(255,255,255,0.72)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 14,
          background: "rgba(91,43,255,0.10)",
          border: "1px solid rgba(91,43,255,0.18)",
          display: "grid",
          placeItems: "center",
          color: PURPLE_1,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 1000, color: "#111827", fontSize: 13 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(15,23,42,0.68)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.8 13.2c0 2.9 2.6 3.9 2.6 3.9s-1.9 5.6-4.4 5.6c-1.2 0-2.1-.8-3.4-.8s-2.4.8-3.4.8c-2.4 0-5.3-5.2-5.3-9.6 0-3.7 2.4-5.6 4.8-5.6 1.2 0 2.3.8 3.1.8.8 0 2.1-.9 3.6-.9.6 0 2.7.1 4 2.1-3.4 1.9-2.6 5.7-1.6 6.7Z" />
      <path d="M14.5 3.2c.6-.7 1-1.7.9-2.7-1 .1-2 .6-2.7 1.3-.6.7-1 1.7-.9 2.7 1-.1 2-.6 2.7-1.3Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6c0 .9 1 1.4 1.7.9l10.2-6.8c.6-.4.6-1.3 0-1.7L9.7 4.3c-.7-.5-1.7 0-1.7.9Z" />
    </svg>
  );
}

function MapPinMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

function ChatMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 14a4 4 0 0 1-4 4H9l-4 3V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M9 9h8M9 13h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
