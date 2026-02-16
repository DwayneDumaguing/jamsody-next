// app/u/[username]/page.tsx
import { createClient } from "@supabase/supabase-js";
import PublicProfileActions from "../../components/PublicProfileActions";


type PublicProfile = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  profile_bio: string | null;
  location: string | null;

  instagram_handle?: string | null;
  youtube_handle?: string | null;
  spotify_handle?: string | null;
  apple_music_handle?: string | null;

  booking_permission?: string | null; // 'everyone' | 'connections' | 'disabled'
};

type UserMedia = {
  id: string;
  media_type: string; // 'image' | 'video' | 'audio'
  storage_path: string;
  caption: string | null;
  order_index: number | null;
  duration_seconds?: number | null;
  duration?: number | null;
};

type UserPrompt = { question: string; answer: string };

const BG = "#F9F5FF";
const CARD_RADIUS = 28;

function displayName(p: PublicProfile) {
  const fn = (p.first_name ?? "").trim();
  const ln = (p.last_name ?? "").trim();
  if (!fn && !ln) return "Unnamed Musician";
  if (!fn) return ln;
  if (!ln) return fn;
  return `${fn} ${ln}`;
}

function titleName(p: PublicProfile) {
  const dn = displayName(p);
  if (dn === "Unnamed Musician" && p.username) return `@${p.username}`;
  return dn;
}

function trimAt(handle: string) {
  const s = handle.trim();
  return s.startsWith("@") ? s.slice(1) : s;
}

function buildPublicMediaUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucket = "user-media"; // <-- match your MediaService.mediaBucket
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

function buildFeed(media: UserMedia[], prompts: UserPrompt[]) {
  const out: Array<{ type: "media" | "prompt"; item: any }> = [];
  const maxLen = Math.max(media.length, prompts.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < media.length) out.push({ type: "media", item: media[i] });
    if (i < prompts.length) out.push({ type: "prompt", item: prompts[i] });
  }
  return out;
}

async function fetchPromptsRobust(supabase: any, userId: string): Promise<UserPrompt[]> {
  try {
    const { data: up1 } = await supabase
      .from("user_prompts")
      .select("prompt_id, answer, prompts(prompt_text)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const list = (up1 ?? []) as any[];
    const missing = list.some((m) => !String(m?.prompts?.prompt_text ?? "").trim());

    if (!list.length || missing) {
      const { data: up2 } = await supabase
        .from("user_prompts")
        .select("prompt_id, answer")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      const rows = (up2 ?? []) as any[];
      const ids = rows.map((r) => r.prompt_id).filter(Boolean);

      let idToText: Record<string, string> = {};
      if (ids.length) {
        const { data: catalog } = await supabase
          .from("prompts")
          .select("id, prompt_text")
          .in("id", ids);

        (catalog ?? []).forEach((c: any) => {
          idToText[c.id] = c.prompt_text ?? "";
        });
      }

      return rows
        .map((r: any) => ({
          question: String(idToText[r.prompt_id] ?? "").trim(),
          answer: String(r.answer ?? "").trim(),
        }))
        .filter((x: UserPrompt) => x.question && x.answer);
    }

    return list
      .map((m: any) => ({
        question: String(m?.prompts?.prompt_text ?? "").trim(),
        answer: String(m?.answer ?? "").trim(),
      }))
      .filter((x: UserPrompt) => x.question && x.answer);
  } catch {
    return [];
  }
}

async function fetchGenres(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data: ug } = await supabase.from("user_genres").select("genre_id").eq("user_id", userId);
    const ids = (ug ?? []).map((x: any) => x.genre_id).filter(Boolean);
    if (!ids.length) return [];

    const { data: g } = await supabase.from("genres").select("id,name").in("id", ids);
    return (g ?? []).map((x: any) => String(x.name ?? "")).filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchInstruments(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data: ui } = await supabase
      .from("user_instruments")
      .select("instrument_id")
      .eq("user_id", userId);

    const ids = (ui ?? []).map((x: any) => x.instrument_id).filter(Boolean);
    if (!ids.length) return [];

    const { data: ins } = await supabase.from("instruments").select("id,name").in("id", ids);
    return (ins ?? []).map((x: any) => String(x.name ?? "")).filter(Boolean);
  } catch {
    return [];
  }
}
async function fetchMedia(supabase: any, userId: string): Promise<UserMedia[]> {
  const { data, error } = await supabase
    .from("user_media")
    .select("id, media_type, storage_path, caption, order_index, duration_seconds")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.log("fetchMedia error:", error);
    return [];
  }

  return ((data ?? []) as UserMedia[])
    .filter((m) => (m.order_index ?? -1) !== 0);
}


export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uname = username.trim().toLowerCase();

  const { data: profile, error } = await supabase
    .from("public_profiles")
    .select(
      "id, username, first_name, last_name, avatar_url, bio, profile_bio, location, instagram_handle, youtube_handle, spotify_handle, apple_music_handle, booking_permission"
    )
    .ilike("username", uname) // case-insensitive exact match (no %)
    .single();

  if (error || !profile) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Profile not found</h1>
        <pre>{JSON.stringify({ uname, error }, null, 2)}</pre>
      </main>
    );
  }

  // fetch rest in parallel (like your Flutter Stage 2)
  const [prompts, media, genres, instruments] = await Promise.all([
    fetchPromptsRobust(supabase, profile.id),
    fetchMedia(supabase, profile.id),
    fetchGenres(supabase, profile.id),
    fetchInstruments(supabase, profile.id),
  ]);

  const feed = buildFeed(media, prompts);

  const deepLink = profile.username
    ? `jamsody://u/${profile.username}`
    : `jamsody://profile/${profile.id}`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamsody.com";
  const currentPath = `/u/${profile.username ?? uname}`;
  const loginUrl = `${siteUrl}/login?next=${encodeURIComponent(currentPath)}`;

  const headerTitle = titleName(profile);
  const name = displayName(profile);

  return (
    <main style={{ minHeight: "100vh", background: BG }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 40px" }}>
        {/* Install/Open/Login Banner */}
        <Banner title={headerTitle} deepLink={deepLink} loginUrl={loginUrl} />

        {/* Header card (matches your Flutter header card vibe) */}
        <Card>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 999,
                background: "rgba(139,92,246,0.10)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={headerTitle}
                  width={80}
                  height={80}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 22, color: "#7C3AED", fontWeight: 800 }}>🎵</span>
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </div>

              {profile.username ? (
                <div style={{ opacity: 0.7, marginTop: 4, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  @{profile.username}
                </div>
              ) : null}

              {profile.location ? (
                <div style={{ opacity: 0.75, marginTop: 8, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📍</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile.location}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {(profile.profile_bio || profile.bio) ? (
            <div style={{ marginTop: 18, fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {profile.profile_bio || profile.bio}
            </div>
          ) : null}

          {/* Social chips */}
          <div style={{ marginTop: 18 }}>
            <SocialChips p={profile} />
          </div>

          {/* Actions row (public equivalent of your action bar) */}
          <PublicProfileActions deepLink={deepLink} loginUrl={loginUrl} />

        
          {/* Tags: Genres + Instruments */}
          {(genres.length || instruments.length) ? (
            <div style={{ marginTop: 22 }}>
              {genres.length ? (
                <div>
                  <div style={{ fontWeight: 700, color: "#7C3AED" }}>Genres</div>
                  <div style={{ marginTop: 8 }}>
                    <Chips values={genres} />
                  </div>
                </div>
              ) : null}

              {instruments.length ? (
                <div style={{ marginTop: genres.length ? 16 : 0 }}>
                  <div style={{ fontWeight: 700, color: "#7C3AED" }}>Instruments</div>
                  <div style={{ marginTop: 8 }}>
                    <Chips values={instruments} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        {/* Feed */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {feed.length === 0 ? (
            <Card>
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 54, opacity: 0.6 }}>🖼️</div>
                <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, opacity: 0.75 }}>
                  No photos or prompts yet
                </div>
              </div>
            </Card>
          ) : (
            feed.map((x, idx) => (
              <Card key={`${x.type}_${idx}`} clip>
                {x.type === "prompt" ? (
                  <PromptCard prompt={x.item} />
                ) : (
                  <MediaCard media={x.item as UserMedia} />
                )}
              </Card>
            ))
          )}
        </div>

        <div style={{ marginTop: 28, textAlign: "center", fontSize: 12, opacity: 0.6 }}>
          Powered by <b>Jamsody</b>
        </div>
      </div>
    </main>
  );
}

/* ---------------- UI components (kept in same file for easy copy/paste) ---------------- */

function Card({
  children,
  clip,
}: {
  children: React.ReactNode;
  clip?: boolean;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: CARD_RADIUS,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.05)",
        padding: clip ? 0 : 24,
        overflow: clip ? "hidden" : "visible",
      }}
    >
      {children}
    </div>
  );
}

function PromptCard({ prompt }: { prompt: UserPrompt }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#8B5CF6" }}>
        {prompt.question}
      </div>
      <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {prompt.answer}
      </div>
    </div>
  );
}

function MediaCard({ media }: { media: UserMedia }) {
  const url = buildPublicMediaUrl(media.storage_path);
  const type = (media.media_type ?? "").toLowerCase();

  if (!url) {
    return (
      <div style={{ height: 420, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
        ⚠️
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "linear-gradient(135deg, #2B0A3D, #6D28D9)",
          padding: 20,
          color: "white",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🎧
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis" }}>
            {media.caption?.trim() || "Audio"}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 20,
            padding: 18,
            background: "rgba(0,0,0,0.20)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 18 + ((i * 37) % 40),
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.85)",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <audio controls style={{ width: "100%" }} preload="none">
            <source src={url} />
          </audio>
        </div>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div style={{ aspectRatio: "3 / 4", background: "#eee" }}>
        <video
          src={url}
          controls
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  // image default
  return (
    <div style={{ aspectRatio: "3 / 4", background: "#eee" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={media.caption ?? "Image"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

function Chips({ values }: { values: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {values.map((v) => (
        <div
          key={v}
          style={{
            padding: "8px 14px",
            borderRadius: 20,
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            background: "linear-gradient(90deg, #8B5CF6, #7C3AED)",
          }}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

function SocialChips({ p }: { p: PublicProfile }) {
  const items: Array<{ label: string; url: string }> = [];

  if (p.instagram_handle?.trim()) {
    const h = trimAt(p.instagram_handle);
    items.push({
      label: `📸 @${h}`,
      url: p.instagram_handle.startsWith("http") ? p.instagram_handle : `https://instagram.com/${h}`,
    });
  }
  if (p.youtube_handle?.trim()) {
    const h = trimAt(p.youtube_handle);
    items.push({
      label: `▶️ @${h}`,
      url: p.youtube_handle.startsWith("http") ? p.youtube_handle : `https://youtube.com/@${h}`,
    });
  }
  if (p.spotify_handle?.trim()) {
    const h = trimAt(p.spotify_handle);
    items.push({
      label: "🎵 Spotify",
      url: p.spotify_handle.startsWith("http") ? p.spotify_handle : `https://open.spotify.com/user/${h}`,
    });
  }
  if (p.apple_music_handle?.trim()) {
    const h = trimAt(p.apple_music_handle);
    items.push({
      label: "🍎 Apple Music",
      url: p.apple_music_handle.startsWith("http") ? p.apple_music_handle : `https://music.apple.com/search?term=${encodeURIComponent(h)}`,
    });
  }

  if (!items.length) return null;

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {items.map((x) => (
        <a
          key={x.url}
          href={x.url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "10px 16px",
            borderRadius: 25,
            background: "rgba(139,92,246,0.10)",
            border: "1px solid rgba(139,92,246,0.20)",
            color: "#8B5CF6",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {x.label}
        </a>
      ))}
    </div>
  );
}

/**
 * Banner: Open app + Install (PWA prompt) + Login
 * - Install button needs client JS, so we keep it as "Open + Login" here (server component safe).
 * If you want the real install prompt button, tell me and I’ll add a tiny client component.
 */
function Banner({ title, deepLink, loginUrl }: { title: string; deepLink: string; loginUrl: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 22,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.05)",
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>🎶 {title} on Jamsody</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7, lineHeight: 1.35 }}>
            Open in the app for chat, bookings and full discovery — or log in to connect.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <a href={deepLink} style={smallFilled()}>
            Open
          </a>
          <a href={loginUrl} style={smallOutline()}>
            Log in
          </a>
        </div>
      </div>
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

function smallFilled(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: "#2B0A3D",
    color: "white",
    fontWeight: 800,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  };
}

function smallOutline(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: "white",
    color: "#111827",
    fontWeight: 800,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.10)",
  };
}
