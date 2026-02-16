// app/u/[username]/page.tsx
import { createClient } from "@supabase/supabase-js";
import PublicProfileActions from "../../components/PublicProfileActions";
import PublicMediaCard from "../../components/PublicMediaCard";

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

  booking_permission?: string | null;
};

type UserMedia = {
  id: string;
  media_type: "image" | "video" | "audio";
  storage_path: string;
  caption: string | null;
  order_index: number | null;
  duration_seconds?: number | null;
  is_public?: boolean | null;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
};

type UserPrompt = { question: string; answer: string };

const BG = "#F9F5FF";
const CARD_RADIUS = 28;
const MAX_W = 680;
const BRAND_PURPLE = "#8B5CF6";
const DEEP_PURPLE = "#2B0A3D";

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

// ✅ your bucket name
function buildPublicMediaUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucket = "user-media";
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
        const { data: catalog } = await supabase.from("prompts").select("id, prompt_text").in("id", ids);
        (catalog ?? []).forEach((c: any) => (idToText[c.id] = c.prompt_text ?? ""));
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
    const { data: ui } = await supabase.from("user_instruments").select("instrument_id").eq("user_id", userId);
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
    .select("id, media_type, storage_path, caption, order_index, duration_seconds, is_public, thumbnail_path, thumbnail_url")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("order_index", { ascending: true });

  if (error) return [];
  return ((data ?? []) as UserMedia[]).filter((m) => (m.order_index ?? -1) !== 0);
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
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
    .ilike("username", uname)
    .single();

  if (error || !profile) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Profile not found</h1>
        <pre>{JSON.stringify({ uname, error }, null, 2)}</pre>
      </main>
    );
  }

  const [prompts, media, genres, instruments] = await Promise.all([
    fetchPromptsRobust(supabase, profile.id),
    fetchMedia(supabase, profile.id),
    fetchGenres(supabase, profile.id),
    fetchInstruments(supabase, profile.id),
  ]);

  const feed = buildFeed(media, prompts);

  const deepLink = profile.username ? `jamsody://u/${profile.username}` : `jamsody://profile/${profile.id}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamsody.com";
  const currentPath = `/u/${profile.username ?? uname}`;
  const loginUrl = `${siteUrl}/login?next=${encodeURIComponent(currentPath)}`;

  const headerTitle = titleName(profile);
  const name = displayName(profile);

  return (
    <main style={{ minHeight: "100vh", background: BG }}>
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "22px 16px 56px" }}>
        <Banner title={headerTitle} deepLink={deepLink} loginUrl={loginUrl} />

        <div style={{ height: 14 }} />

        <Card>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Avatar url={profile.avatar_url} title={headerTitle} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={styles.nameLine}>{name}</div>
              {profile.username ? <div style={styles.subLine}>@{profile.username}</div> : null}
              {profile.location ? (
                <div style={{ ...styles.subLine, display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}>
                  <PinIcon />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile.location}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {(profile.profile_bio || profile.bio) ? <div style={styles.bio}>{profile.profile_bio || profile.bio}</div> : null}

          <div style={{ marginTop: 16 }}>
            <SocialChips p={profile} />
          </div>

          {/* Share only */}
          <PublicProfileActions />

          {(genres.length || instruments.length) ? (
            <div style={{ marginTop: 20 }}>
              {genres.length ? (
                <div>
                  <div style={styles.sectionTitle}>Genres</div>
                  <div style={{ marginTop: 8 }}>
                    <Chips values={genres} />
                  </div>
                </div>
              ) : null}

              {instruments.length ? (
                <div style={{ marginTop: genres.length ? 14 : 0 }}>
                  <div style={styles.sectionTitle}>Instruments</div>
                  <div style={{ marginTop: 8 }}>
                    <Chips values={instruments} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        <div style={{ height: 16 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {feed.length === 0 ? (
            <Card>
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 54, opacity: 0.55 }}>🖼️</div>
                <div style={{ marginTop: 12, fontSize: 18, fontWeight: 800, opacity: 0.75 }}>
                  No photos or prompts yet
                </div>
              </div>
            </Card>
          ) : (
            feed.map((x, idx) => {
              if (x.type === "prompt") {
                return (
                  <Card key={`${x.type}_${idx}`} clip>
                    <PromptCard prompt={x.item as UserPrompt} />
                  </Card>
                );
              }

              const m = x.item as UserMedia;
              const url = buildPublicMediaUrl(m.storage_path);

              // poster preference: thumbnail_url > thumbnail_path
              const poster = m.thumbnail_url?.trim()
                ? m.thumbnail_url
                : m.thumbnail_path?.trim()
                  ? buildPublicMediaUrl(m.thumbnail_path)
                  : null;

              return (
                <Card key={`${x.type}_${idx}`} clip>
                  <PublicMediaCard type={m.media_type} url={url} poster={poster} caption={m.caption} />
                </Card>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 28, textAlign: "center", fontSize: 12, opacity: 0.55 }}>
          Powered by <b>Jamsody</b>
        </div>
      </div>
    </main>
  );
}

/* ---------------- UI bits ---------------- */

function Card({ children, clip }: { children: React.ReactNode; clip?: boolean }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: CARD_RADIUS,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.05)",
        padding: clip ? 0 : 22,
        overflow: clip ? "hidden" : "visible",
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
        width: 82,
        height: 82,
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
        <img src={url} alt={title} width={82} height={82} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: 22, color: "#7C3AED", fontWeight: 900 }}>♪</span>
      )}
    </div>
  );
}

function PromptCard({ prompt }: { prompt: UserPrompt }) {
  return (
    <div style={{ padding: 22 }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: BRAND_PURPLE }}>{prompt.question}</div>
      <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.65, whiteSpace: "pre-wrap", color: "#111827" }}>
        {prompt.answer}
      </div>
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
            fontWeight: 800,
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
  const items: Array<{ label: string; url: string; icon: React.ReactNode }> = [];

  if (p.instagram_handle?.trim()) {
    const h = trimAt(p.instagram_handle);
    items.push({
      label: `@${h}`,
      url: p.instagram_handle.startsWith("http") ? p.instagram_handle : `https://instagram.com/${h}`,
      icon: <InstagramIcon />,
    });
  }
  if (p.youtube_handle?.trim()) {
    const h = trimAt(p.youtube_handle);
    items.push({
      label: `@${h}`,
      url: p.youtube_handle.startsWith("http") ? p.youtube_handle : `https://youtube.com/@${h}`,
      icon: <YouTubeIcon />,
    });
  }
  if (p.spotify_handle?.trim()) {
    const h = trimAt(p.spotify_handle);
    items.push({
      label: "Spotify",
      url: p.spotify_handle.startsWith("http") ? p.spotify_handle : `https://open.spotify.com/user/${h}`,
      icon: <SpotifyIcon />,
    });
  }
  if (p.apple_music_handle?.trim()) {
    const h = trimAt(p.apple_music_handle);
    items.push({
      label: "Apple Music",
      url: p.apple_music_handle.startsWith("http") ? p.apple_music_handle : `https://music.apple.com/search?term=${encodeURIComponent(h)}`,
      icon: <AppleMusicIcon />,
    });
  }

  if (!items.length) return null;

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {items.map((x) => (
        <a
          key={x.url}
          href={x.url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "10px 12px",
            borderRadius: 18,
            background: "rgba(139,92,246,0.10)",
            border: "1px solid rgba(139,92,246,0.18)",
            color: "#111827",
            fontWeight: 900,
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            maxWidth: "100%",
          }}
        >
          <span style={{ color: BRAND_PURPLE, display: "inline-flex" }}>{x.icon}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.label}</span>
        </a>
      ))}
    </div>
  );
}

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
          <div style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>{title} on Jamsody</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(17,24,39,0.70)", lineHeight: 1.35 }}>
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
    boxShadow: "0 8px 22px rgba(43,10,61,0.18)",
  };
}

function smallOutline(): React.CSSProperties {
  return {
    height: 38,
    padding: "0 14px",
    borderRadius: 14,
    background: "white",
    color: "#111827",
    fontWeight: 900,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.10)",
  };
}

const styles: Record<string, React.CSSProperties> = {
  nameLine: {
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1.15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#111827",
  },
  subLine: {
    opacity: 0.72,
    marginTop: 4,
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#111827",
    fontWeight: 700,
  },
  bio: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    color: "#111827",
    opacity: 0.92,
  },
  sectionTitle: {
    fontWeight: 900,
    color: "#7C3AED",
    fontSize: 14,
  },
};

/* ---------------- tiny icons ---------------- */

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12s0-4.2-.6-6.1A3 3 0 0 0 18.3 3.7C16.4 3 12 3 12 3s-4.4 0-6.3.7A3 3 0 0 0 3.6 5.9C3 7.8 3 12 3 12s0 4.2.6 6.1a3 3 0 0 0 2.1 2.2C7.6 21 12 21 12 21s4.4 0 6.3-.7a3 3 0 0 0 2.1-2.2C21 16.2 21 12 21 12Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M10 9.5 15 12l-5 2.5v-5Z" fill="currentColor" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M8 10.2c3.5-1 7.6-.6 10.2.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8.6 13.2c2.8-.7 6-.4 8.2.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M9.3 15.9c2-.4 4.2-.2 5.8.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function AppleMusicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 3v12.5a2.5 2.5 0 1 1-1.5-2.3V6l8-2v9.5a2.5 2.5 0 1 1-1.5-2.3V4.5L14 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
