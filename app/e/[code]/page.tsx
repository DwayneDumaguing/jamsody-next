// app/e/[code]/page.tsx
import React from "react";
import { createClient } from "@supabase/supabase-js";

const MAX_W = 680;
const CARD_RADIUS = 28;
const DEEP_PURPLE = "#2B0A3D";

type PublicEvent = {
  id: string;
  event_code: string | null;
  title: string;
  description: string | null;
  event_type: string | null;

  publish_state: string | null;
  visibility: string | null;
  status: string | null;

  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss

  is_online: boolean | null;
  meeting_link: string | null;

  location_name: string | null;
  location_address: string | null;

  cover_image_url: string | null;

  is_free: boolean | null;
  price: number | string | null;
  capacity: number | null;

  host?: {
    id?: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

function isPublishedPublic(e: PublicEvent) {
  const ps = (e.publish_state ?? "").toLowerCase();
  const vis = (e.visibility ?? "").toLowerCase();
  return ps === "published" && vis === "public";
}

function hostDisplayName(h?: PublicEvent["host"]) {
  const fn = (h?.first_name ?? "").trim();
  const ln = (h?.last_name ?? "").trim();
  const full = `${fn} ${ln}`.trim();
  if (full) return full;

  const u = (h?.username ?? "").trim();
  if (u) return u.startsWith("@") ? u : `@${u}`;
  return "Host";
}

function hostUsername(h?: PublicEvent["host"]) {
  const u = (h?.username ?? "").trim();
  if (!u) return "";
  return u.startsWith("@") ? u : `@${u}`;
}

function fmtDateTime(e: PublicEvent) {
  // Safest parsing: build a date object from YYYY-MM-DD manually
  const [y, m, d] = (e.date ?? "").split("-").map((x) => Number(x));
  const safeDate = y && m && d ? new Date(y, m - 1, d) : null;

  const day = safeDate
    ? safeDate.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : e.date;

  const fmtTime = (t?: string | null) => {
    if (!t) return "";
    const [hh, mm] = t.split(":");
    const dt = new Date(2020, 0, 1, Number(hh || 0), Number(mm || 0));
    return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  const st = fmtTime(e.start_time);
  const et = fmtTime(e.end_time);

  return st && et ? `${day} • ${st} – ${et}` : day;
}

function cleanAtUsername(u: string) {
  const s = (u ?? "").trim();
  return s.startsWith("@") ? s.slice(1) : s;
}

export default async function Page({ params }: { params: { code: string } }) {
  const token = (params.code ?? "").trim();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      event_code,
      title,
      description,
      event_type,
      publish_state,
      visibility,
      status,
      date,
      start_time,
      end_time,
      is_online,
      meeting_link,
      location_name,
      location_address,
      cover_image_url,
      is_free,
      price,
      capacity,
      host:public_profiles!events_host_id_fkey(
        id, username, first_name, last_name, avatar_url
      )
    `
    )
    .eq("event_code", token)
    .maybeSingle();

  const event = (data ?? null) as PublicEvent | null;

  // Hide if not found OR not allowed for public OR cancelled
  if (
    error ||
    !event ||
    !isPublishedPublic(event) ||
    (event.status ?? "").toLowerCase() === "cancelled"
  ) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Event not found</h1>
        <div style={{ opacity: 0.7, marginTop: 8 }}>
          This event might be draft, private, cancelled, or removed.
        </div>
      </main>
    );
  }

  const headerTitle = (event.title ?? "").trim() || "Event";
  const subtitle = fmtDateTime(event);

  // ✅ only ONE CTA button (in the top banner)
  const deepLink = `jamsody://e/${event.event_code ?? event.id}`;

  const meeting = (event.meeting_link ?? "").trim();
  const hasMeeting = meeting.length > 0;

  // ✅ Online only if explicitly online OR has meeting link
  const isOnline = !!event.is_online || hasMeeting;

  const loc = isOnline
    ? "Online"
    : [event.location_name?.trim(), event.location_address?.trim()]
        .filter((x) => !!x)
        .join(" • ");

  const typeLabel = (event.event_type ?? "Event").toUpperCase();

  const hostU = cleanAtUsername(event.host?.username ?? "");
  const hostHref = hostU ? `/u/${hostU}` : null;

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#FAFAFD",
          zIndex: -1,
        }}
      />

      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "0 16px 56px" }}>
        {/* sticky top banner (single CTA) */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            paddingTop: 22,
            paddingBottom: 14,
            background: "#FAFAFD",
          }}
        >
          <Banner title={headerTitle} subtitle={subtitle} deepLink={deepLink} />
        </div>

        <div style={{ height: 14 }} />

        <Card clip>
          {event.cover_image_url ? (
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9", // ✅ 16:9 banner
                overflow: "hidden",
                background: "rgba(17,24,39,0.04)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.cover_image_url}
                alt={headerTitle}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : null}

          <div style={{ padding: 22 }}>
            {/* Title + Type pill */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 950,
                    lineHeight: 1.15,
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {headerTitle}
                </div>
              </div>

              <div style={typePill()}>{typeLabel}</div>
            </div>

            {/* Date + Location card */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 18,
                background: "rgba(17,24,39,0.03)",
                border: "1px solid rgba(17,24,39,0.06)",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "rgba(17,24,39,0.7)", marginTop: 1 }}>
                  <CalendarIcon />
                </span>
                <div style={{ fontSize: 14, fontWeight: 850, color: "#111827" }}>
                  {subtitle}
                </div>
              </div>

              {loc ? (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "rgba(17,24,39,0.7)", marginTop: 1 }}>
                    <PinIcon />
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 850, color: "#111827" }}>
                    {loc}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Host (clickable, no extra button) */}
            <div style={{ marginTop: 18 }}>
              <a
                href={hostHref ?? "#"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  color: "inherit",
                  pointerEvents: hostHref ? "auto" : "none",
                }}
              >
                <Avatar url={event.host?.avatar_url ?? null} title={hostDisplayName(event.host)} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "rgba(17,24,39,0.65)" }}>
                    Hosted by
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 950, color: "#111827" }}>
                    {hostDisplayName(event.host)}
                  </div>
                  {hostUsername(event.host) ? (
                    <div style={{ fontSize: 13, fontWeight: 850, opacity: 0.72 }}>
                      {hostUsername(event.host)}
                    </div>
                  ) : null}
                </div>
              </a>
            </div>

            {/* Description */}
            {(event.description ?? "").trim() ? (
              <div
                style={{
                  marginTop: 16,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "#111827",
                  opacity: 0.9,
                  whiteSpace: "pre-wrap",
                }}
              >
                {event.description}
              </div>
            ) : null}

            <div style={{ marginTop: 22, fontSize: 12, opacity: 0.55 }}>
              Powered by <b>Jamsody</b>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

/* ---------- UI bits ---------- */

function Card({ children, clip }: { children: React.ReactNode; clip?: boolean }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        borderRadius: CARD_RADIUS,
        boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
        border: "1px solid rgba(17,24,39,0.06)",
        overflow: clip ? "hidden" : "visible",
      }}
    >
      {children}
    </div>
  );
}

function Banner({ title, subtitle, deepLink }: { title: string; subtitle: string; deepLink: string }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 22,
        boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
        border: "1px solid rgba(17,24,39,0.06)",
        padding: "14px 16px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>
            {title} on Jamsody
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "rgba(17,24,39,0.70)",
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <a href={deepLink} style={smallFilled()}>
            Open in Jamsody
          </a>
        </div>
      </div>
    </div>
  );
}

function Avatar({ url, title }: { url: string | null; title: string }) {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 999,
        background: "rgba(139,92,246,0.10)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: "1px solid rgba(139,92,246,0.18)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? (
        <img
          src={url}
          alt={title}
          width={46}
          height={46}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontSize: 16, color: "#7C3AED", fontWeight: 900 }}>♪</span>
      )}
    </div>
  );
}

function typePill(): React.CSSProperties {
  return {
    flexShrink: 0,
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: 0.6,
    color: "#2B0A3D",
    background: "rgba(139,92,246,0.10)",
    border: "1px solid rgba(139,92,246,0.18)",
    lineHeight: 1.1,
    marginTop: 2,
  };
}

function smallFilled(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: DEEP_PURPLE,
    color: "white",
    fontWeight: 900,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 10px 26px rgba(43, 10, 61, 0.20)",
    whiteSpace: "nowrap",
  };
}

/* ---------- Icons ---------- */

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

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </svg>
  );
}
