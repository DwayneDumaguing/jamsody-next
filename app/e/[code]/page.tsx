// app/e/[code]/page.tsx
import React from "react";
import { createClient } from "@supabase/supabase-js";

const MAX_W = 680;
const CARD_RADIUS = 28;
const BRAND_PURPLE = "#8B5CF6";
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

  date: string;
  start_time: string;
  end_time: string;

  is_online: boolean | null;
  meeting_link: string | null;

  location_name: string | null;
  location_address: string | null;

  cover_image_url: string | null;

  is_free: boolean | null;
  price: number | string | null;
  capacity: number | null;

  host?: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

function fmtDateTime(e: PublicEvent) {
  // e.date is YYYY-MM-DD; time is HH:mm:ss
  const date = new Date(e.date);
  const day = isNaN(date.getTime()) ? e.date : date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const fmtTime = (t?: string | null) => {
    if (!t) return "";
    const [hh, mm] = t.split(":");
    const d = new Date(2020, 0, 1, Number(hh || 0), Number(mm || 0));
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  const st = fmtTime(e.start_time);
  const et = fmtTime(e.end_time);
  return st && et ? `${day} • ${st} – ${et}` : day;
}

function hostName(h?: PublicEvent["host"]) {
  const fn = (h?.first_name ?? "").trim();
  const ln = (h?.last_name ?? "").trim();
  const full = `${fn} ${ln}`.trim();
  if (full) return full;
  if (h?.username?.trim()) return h.username.startsWith("@") ? h.username : `@${h.username}`;
  return "Host";
}

function isPublishedPublic(e: PublicEvent) {
  const ps = (e.publish_state ?? "").toLowerCase();
  const vis = (e.visibility ?? "").toLowerCase();
  return ps === "published" && vis === "public";
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = code.trim();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ IMPORTANT:
  // - This requires RLS to allow reading ONLY published+public events,
  //   otherwise this will 401. If you don't have that yet, we can switch to an Edge Function.
  const { data, error } = await supabase
    .from("events")
    .select(`
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
        username, first_name, last_name, avatar_url
      )
    `)
    .eq("event_code", token)
    .maybeSingle();

  const event = (data ?? null) as PublicEvent | null;

  // Hide if not found OR not allowed for public
  if (error || !event || !isPublishedPublic(event) || (event.status ?? "").toLowerCase() === "cancelled") {
    return (
      <main style={{ padding: 40 }}>
        <h1>Event not found</h1>
        <div style={{ opacity: 0.7, marginTop: 8 }}>
          This event might be draft, private, or removed.
        </div>
      </main>
    );
  }

  const headerTitle = event.title?.trim() || "Event";
  const subtitle = fmtDateTime(event);

  // Deep link (your app handler supports /e/<code>)
  const deepLink = `jamsody://e/${event.event_code ?? event.id}`;

  const loc =
    (event.is_online || (event.meeting_link ?? "").trim())
      ? "Online"
      : [event.location_name?.trim(), event.location_address?.trim()].filter(Boolean).join(" • ");

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* background */}
      <div style={{ position: "fixed", inset: 0, background: "#FAFAFD", zIndex: -1 }} />

      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "0 16px 56px" }}>
        {/* sticky top banner */}
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover_image_url}
              alt={headerTitle}
              style={{ width: "100%", height: 220, objectFit: "cover" }}
            />
          ) : (
            <div style={{ height: 18 }} />
          )}

          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 22, fontWeight: 950, color: "#111827" }}>
              {headerTitle}
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Chip>{(event.event_type ?? "Event").toUpperCase()}</Chip>
              <Chip>{subtitle}</Chip>
              {loc ? <Chip>{loc}</Chip> : null}
            </div>

            {event.description?.trim() ? (
              <div style={{ marginTop: 16, fontSize: 16, lineHeight: 1.65, color: "#111827", opacity: 0.92, whiteSpace: "pre-wrap" }}>
                {event.description}
              </div>
            ) : null}

            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar url={event.host?.avatar_url ?? null} title={hostName(event.host)} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "rgba(17,24,39,0.7)" }}>Hosted by</div>
                <div style={{ fontSize: 16, fontWeight: 950, color: "#111827" }}>{hostName(event.host)}</div>
                {event.host?.username ? (
                  <div style={{ fontSize: 13, fontWeight: 850, opacity: 0.72 }}>
                    {event.host.username.startsWith("@") ? event.host.username : `@${event.host.username}`}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={deepLink} style={primaryBtn()}>
                Open in app
              </a>
              <a href={`/u/${(event.host?.username ?? "").replace(/^@/, "")}`} style={secondaryBtn()}>
                View host profile
              </a>
            </div>

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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>{title} on Jamsody</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(17,24,39,0.70)", lineHeight: 1.35 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <a href={deepLink} style={smallFilled()}>
            Open
          </a>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        color: "#111827",
        background: "rgba(139,92,246,0.10)",
        border: "1px solid rgba(139,92,246,0.18)",
      }}
    >
      {children}
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
        <img src={url} alt={title} width={46} height={46} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: 16, color: "#7C3AED", fontWeight: 900 }}>♪</span>
      )}
    </div>
  );
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
    boxShadow: "0 10px 26px rgba(43,10,61,0.20)",
  };
}

function primaryBtn(): React.CSSProperties {
  return {
    height: 44,
    padding: "0 16px",
    borderRadius: 14,
    background: "linear-gradient(90deg, #8B5CF6, #7C3AED)",
    color: "white",
    fontWeight: 950,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 10px 22px rgba(124,58,237,0.18)",
  };
}

function secondaryBtn(): React.CSSProperties {
  return {
    height: 44,
    padding: "0 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(17,24,39,0.10)",
    color: "#111827",
    fontWeight: 950,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 10px 22px rgba(17,24,39,0.06)",
  };
}
