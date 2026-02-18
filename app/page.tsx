// app/page.tsx
import React from "react";

const MAX_W = 1120;

// less “bright” modern amber → soft orange
const ORANGE_A = "#F59E0B"; // amber-500 vibe
const ORANGE_B = "#FDBA74"; // orange-300 vibe

const PURPLE_A = "#7C3AED";
const PURPLE_B = "#5B21B6";
const INK = "#0F172A";

const APP_STORE_URL = "https://apps.apple.com"; // TODO replace real link
const ANDROID_COMING_SOON = true;

// homepage open app (no deep target)
const DEEP_LINK_HOME = "jamsody://";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F7F7FB" }}>
      {/* Top header gradient */}
      <header style={headerWrap()}>
        <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "18px 18px 0" }}>
          <TopNav />

          <div style={heroGrid()}>
            {/* Left */}
            <section style={{ padding: "22px 0" }}>
              <div style={pill()}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: PURPLE_A,
                    display: "inline-block",
                  }}
                />
                Music meets community
              </div>

              <h1 style={heroTitle()}>
                Find Your <span style={heroAccent()}>Rhythm</span>
              </h1>

              <p style={heroDesc()}>
                Discover musicians nearby, host events, jam with friends, book one-on-one sessions, and
                showcase gigs — all in one platform for musicians and music lovers.
              </p>

              <div style={featureGrid()}>
                <Feature title="Discover" desc="Musicians around you" icon={<PinIcon />} />
                <Feature title="Connect" desc="Chat & invite quickly" icon={<ChatIcon />} />
                <Feature title="Organise" desc="Sessions & public gigs" icon={<CalendarIcon />} />
                <Feature title="Showcase" desc="Share your music & profile" icon={<SparkIcon />} />
              </div>

              <div style={tip()}>
                Tip: For best results, open shared links in <b>Safari</b>, then tap <b>Open in Jamsody</b>.
              </div>
            </section>

            {/* Right */}
            <aside style={rightCol()}>
              <div id="download" style={downloadCard()}>
                <div style={bigIconWrap()}>
                  {/* put your icon in public/jamsody-icon.png */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/jamsody-icon.png"
                    alt="Jamsody"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 26,
                      objectFit: "cover",
                      boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
                      background: "transparent",
                    }}
                  />
                </div>

                <div style={{ marginTop: 14, fontSize: 18, fontWeight: 950, color: INK }}>
                  Download Jamsody
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "rgba(15,23,42,0.70)", lineHeight: 1.45 }}>
                  Start discovering and jamming today.
                </div>

                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                  <a href={APP_STORE_URL} target="_blank" rel="noreferrer" style={storeBtn()}>
                    <span style={{ display: "inline-flex", marginRight: 10 }}>
                      <AppleIcon />
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                      <span style={{ fontSize: 11, opacity: 0.75, fontWeight: 800 }}>Download on the</span>
                      <span style={{ fontSize: 16, fontWeight: 950 }}>App Store</span>
                    </div>
                    <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                      <ArrowUpRight />
                    </span>
                  </a>

                  <div style={storeBtn({ disabled: true })}>
                    <span style={{ display: "inline-flex", marginRight: 10, opacity: 0.55 }}>
                      <PlayIcon />
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, opacity: 0.75 }}>
                      <span style={{ fontSize: 11, fontWeight: 800 }}>Android</span>
                      <span style={{ fontSize: 16, fontWeight: 950 }}>
                        {ANDROID_COMING_SOON ? "Coming soon" : "Get it on Google Play"}
                      </span>
                    </div>
                  </div>

                  <a href={DEEP_LINK_HOME} style={openBtn()}>
                    Open in Jamsody
                  </a>
                </div>

                <div style={{ marginTop: 16, fontSize: 12, color: "rgba(15,23,42,0.55)", textAlign: "center" }}>
                  Powered by <b>Jamsody</b>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* subtle fade under header so no “hard cutoff” + no giant blank space */}
        <div style={headerFade()} />
      </header>

      {/* Body area (small, so page doesn’t end with huge white block) */}
    
    </main>
  );
}

/* ---------- Components ---------- */

function TopNav() {
  return (
    <div style={navRow()}>
      <div style={navBrand()}>
        <div style={miniLogoWrap()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jamsody-mark.png"
            alt="Jamsody"
            style={{
              width: 28,
              height: 28,
              display: "block",       // ✅ important (kills baseline shift)
              borderRadius: 8,
            }}
          />
        </div>

        <div style={navTitle()}>Jamsody</div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <a href="#download" style={navGhostBtn()}>
          Download
        </a>
        <a href={DEEP_LINK_HOME} style={navSolidBtn()}>
          Open app
        </a>
      </div>
    </div>
  );
}



function Feature({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div style={featureCard()}>
      <div style={featureIconWrap()}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 950, color: INK }}>{title}</div>
        <div style={{ marginTop: 2, fontSize: 13, color: "rgba(15,23,42,0.70)" }}>{desc}</div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

function headerWrap(): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${ORANGE_A} 0%, ${ORANGE_B} 100%)`,
    boxShadow: "0 18px 60px rgba(15,23,42,0.12)",
  };
}

function headerFade(): React.CSSProperties {
  return {
    height: 40,
    background: "linear-gradient(to bottom, rgba(247,247,251,0) 0%, #F7F7FB 100%)",
  };
}

function bodyWrap(): React.CSSProperties {
  return {
    background: "#F7F7FB",
  };
}

function navRow(): React.CSSProperties {
  return {
    height: 64,                  // ✅ fixed height makes it look “designed”
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",        // ✅ true vertical center
    gap: 14,
  };
}

function navBrand(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  };
}

function navTitle(): React.CSSProperties {
  return {
    fontWeight: 950,
    color: INK,
    fontSize: 18,
    lineHeight: "18px",          // ✅ kills baseline weirdness
    letterSpacing: 0.2,
    marginTop: 1,                // ✅ micro nudge (adjust 0..2 if needed)
  };
}

function miniLogoWrap(): React.CSSProperties {
  return {
    width: 44,
    height: 44,                  // ✅ same width/height
    borderRadius: 14,
    background: "rgba(255,255,255,0.35)",
    border: "1px solid rgba(255,255,255,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}






function navGhostBtn(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(255,255,255,0.60)",
    color: INK,
    fontWeight: 950,
    fontSize: 13,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
  };
}

function navSolidBtn(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: `linear-gradient(90deg, ${PURPLE_A}, ${PURPLE_B})`,
    color: "white",
    fontWeight: 950,
    fontSize: 13,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(91,33,182,0.22)",
    whiteSpace: "nowrap",
  };
}

function heroGrid(): React.CSSProperties {
  return {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: 18,
    alignItems: "stretch",
  };
}

function heroTitle(): React.CSSProperties {
  return {
    marginTop: 14,
    marginBottom: 0,
    fontSize: "clamp(42px, 5.5vw, 64px)",
    lineHeight: 1.02,
    letterSpacing: -1.2,
    fontWeight: 1000 as any,
    color: INK,
  };
}

function heroAccent(): React.CSSProperties {
  return {
    background: `linear-gradient(90deg, ${PURPLE_A}, ${PURPLE_B})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    letterSpacing: -0.6,
  };
}

function heroDesc(): React.CSSProperties {
  return {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 1.7,
    color: "rgba(15,23,42,0.80)",
    maxWidth: 620,
  };
}

function pill(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(255,255,255,0.60)",
    fontWeight: 950,
    fontSize: 13,
    color: "rgba(15,23,42,0.82)",
    boxShadow: "0 10px 26px rgba(15,23,42,0.08)",
    width: "fit-content",
  };
}

function featureGrid(): React.CSSProperties {
  return {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    maxWidth: 680,
  };
}

function featureCard(): React.CSSProperties {
  return {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.58)",
    boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
    minHeight: 64, // ✅ keeps all 4 cards same height on mobile
  };
}

function featureIconWrap(): React.CSSProperties {
  return {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: "rgba(124,58,237,0.10)",
    border: "1px solid rgba(124,58,237,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: PURPLE_A,
    flexShrink: 0,
  };
}

function rightCol(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "stretch",
  };
}

function downloadCard(): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: 26,
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.58)",
    boxShadow: "0 18px 52px rgba(15,23,42,0.12)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  };
}

function bigIconWrap(): React.CSSProperties {
  return {
    marginTop: 4,
    width: "100%",
    display: "flex",
    justifyContent: "center",
  };
}

function storeBtn(opts?: { disabled?: boolean }): React.CSSProperties {
  const disabled = !!opts?.disabled;
  return {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 12px 26px rgba(15,23,42,0.06)",
    color: INK,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    opacity: disabled ? 0.72 : 1,
    pointerEvents: disabled ? "none" : "auto",
  };
}

function openBtn(): React.CSSProperties {
  return {
    width: "100%",
    height: 48,
    borderRadius: 18,
    background: `linear-gradient(90deg, ${PURPLE_A}, ${PURPLE_B})`,
    color: "white",
    fontWeight: 1000 as any,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 16px 32px rgba(91,33,182,0.22)",
  };
}

function tip(): React.CSSProperties {
  return {
    marginTop: 18,
    fontSize: 12,
    color: "rgba(15,23,42,0.72)",
  };
}

function miniNote(): React.CSSProperties {
  return {
    borderRadius: 18,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(15,23,42,0.08)",
    padding: "14px 16px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
    color: "rgba(15,23,42,0.78)",
    lineHeight: 1.6,
    fontSize: 13,
  };
}

/* ---------- Icons ---------- */

function ArrowUpRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 7h7v7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.7 13.1c0-2 1.6-3 1.7-3.1-1-1.4-2.6-1.6-3.1-1.6-1.3-.1-2.5.8-3.2.8s-1.7-.8-2.8-.8c-1.4 0-2.7.8-3.4 2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.9-1 2.6-2 .8-1.2 1.2-2.4 1.2-2.4-.1 0-2.1-.8-2.1-3.6ZM14.7 6.6c.6-.7 1-1.8.9-2.8-.9.1-2 .6-2.6 1.3-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l12-7-12-7Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.2 4.2L17.4 8 13.2 9.2 12 13.4 10.8 9.2 6.6 8l4.2-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M19 13l.8 2.8L22 17l-2.2.2L19 20l-.8-2.8L16 17l2.2-1.2L19 13Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
