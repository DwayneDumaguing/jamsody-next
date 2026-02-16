// app/u/[username]/page.tsx
import React from "react";
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

const CARD_RADIUS = 28;
const MAX_W = 680;
const BRAND_PURPLE = "#8B5CF6";
const DEEP_PURPLE = "#2B0A3D";

// 🔥 Flutter-like soft background
const FLUTTER_BG = "#FAFAFD"; // very soft near-white violet tint

function displayName(p: PublicProfile) {
  const fn = (p.first_name ?? "").trim();
  const ln = (p.last_name ?? "").trim();
  if (!fn && !ln) return "Unnamed Musician";
  if (!fn) return ln;
  if (!ln) return fn;
  return `${fn} ${ln}`;
}

function titleName(p: PublicProfile) {
  if (p.username) return `@${p.username}`;
  return displayName(p);
}

function trimAt(handle: string) {
  const s = handle.trim();
  return s.startsWith("@") ? s.slice(1) : s;
}

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

/* ---------------- FETCHERS ---------------- */

async function fetchPromptsRobust(supabase: any, userId: string): Promise<UserPrompt[]> {
  try {
    const { data } = await supabase
      .from("user_prompts")
      .select("prompt_id, answer, prompts(prompt_text)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    return (data ?? [])
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
    return (g ?? []).map((x: any) => x.name).filter(Boolean);
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
    return (ins ?? []).map((x: any) => x.name).filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchMedia(supabase: any, userId: string): Promise<UserMedia[]> {
  const { data } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("order_index", { ascending: true });

  return ((data ?? []) as UserMedia[]).filter((m) => (m.order_index ?? -1) !== 0);
}

/* ---------------- PAGE ---------------- */

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uname = username.trim().toLowerCase();

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .ilike("username", uname)
    .single();

  if (!profile) {
    return <main style={{ padding: 40 }}>Profile not found</main>;
  }

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

  const headerTitle = titleName(profile);

  return (
    <main style={{ minHeight: "100vh", background: FLUTTER_BG }}>
      {/* ✅ STICKY HEADER */}
      <div style={stickyHeader}>
        <Banner title={headerTitle} deepLink={deepLink} />
      </div>

      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "110px 16px 56px" }}>
        <Card>
          <Avatar url={profile.avatar_url} title={headerTitle} />

          {(profile.profile_bio || profile.bio) && (
            <div style={{ marginTop: 16 }}>
              {profile.profile_bio || profile.bio}
            </div>
          )}

          <PublicProfileActions deepLink={deepLink} />

          {genres.length > 0 && <Chips values={genres} />}
          {instruments.length > 0 && <Chips values={instruments} />}
        </Card>

        <div style={{ height: 16 }} />

        {feed.map((x, idx) => {
          if (x.type === "prompt") {
            return (
              <Card key={idx}>
                <div style={{ fontWeight: 800 }}>{x.item.question}</div>
                <div style={{ marginTop: 8 }}>{x.item.answer}</div>
              </Card>
            );
          }

          const m = x.item as UserMedia;
          const url = buildPublicMediaUrl(m.storage_path);

          return (
            <Card key={idx} clip>
              <PublicMediaCard
                type={m.media_type}
                url={url}
                caption={m.caption}
              />
            </Card>
          );
        })}
      </div>
    </main>
  );
}

/* ---------------- UI ---------------- */

const stickyHeader: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  background: FLUTTER_BG,
  padding: "16px",
};

function Card({ children, clip }: { children: React.ReactNode; clip?: boolean }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: CARD_RADIUS,
        padding: clip ? 0 : 22,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function Avatar({ url }: { url: string | null; title: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      {url && (
        <img
          src={url}
          width={90}
          height={90}
          style={{ borderRadius: "999px", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

function Chips({ values }: { values: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      {values.map((v) => (
        <div
          key={v}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            background: BRAND_PURPLE,
            color: "white",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

function Banner({ title, deepLink }: { title: string; deepLink: string }) {
  return (
    <div
      style={{
        maxWidth: MAX_W,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: 800 }}>{title} on Jamsody</div>
      <a href={deepLink} style={smallFilled()}>
        Open
      </a>
    </div>
  );
}

function smallFilled(): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 14,
    background: DEEP_PURPLE,
    color: "white",
    fontWeight: 800,
    textDecoration: "none",
  };
}
