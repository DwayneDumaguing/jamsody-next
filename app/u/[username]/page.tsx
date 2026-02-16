// app/u/[username]/page.tsx
import React from "react";
import { createClient } from "@supabase/supabase-js";
import PublicProfileActions from "../../components/PublicProfileActions";
import PublicMediaCard from "../../components/PublicMediaCard";

/* ---------------- Types ---------------- */

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

/* ---------------- Design Constants ---------------- */

const MAX_W = 680;
const CARD_RADIUS = 26;
const BRAND_PURPLE = "#7C3AED";
const DEEP_PURPLE = "#2B0A3D";

/* ---------------- Helpers ---------------- */

function displayName(p: PublicProfile) {
  const fn = (p.first_name ?? "").trim();
  const ln = (p.last_name ?? "").trim();
  if (!fn && !ln) return "Unnamed Musician";
  return `${fn} ${ln}`.trim();
}

function trimAt(handle: string) {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}

function buildPublicMediaUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/user-media/${storagePath}`;
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

/* ---------------- Page ---------------- */

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .ilike("username", username.trim().toLowerCase())
    .single();

  if (!profile) {
    return <main style={{ padding: 40 }}>Profile not found</main>;
  }

  const { data: media } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("order_index", { ascending: true });

  const { data: promptRows } = await supabase
    .from("user_prompts")
    .select("answer, prompts(prompt_text)")
    .eq("user_id", profile.id);

  const prompts: UserPrompt[] =
    (promptRows ?? [])
      .map((r: any) => ({
        question: r.prompts?.prompt_text ?? "",
        answer: r.answer ?? "",
      }))
      .filter((p: UserPrompt) => p.question && p.answer);

  const feed = buildFeed(media ?? [], prompts);

  const deepLink = `jamsody://u/${profile.username}`;

  /* ---------------- UI ---------------- */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FAF9FF", // soft flutter tone
      }}
    >
      {/* Fixed top banner */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
          background: "rgba(250,249,255,0.85)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            maxWidth: MAX_W,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            @{profile.username} is on Jamsody
          </div>
          <a
            href={deepLink}
            style={{
              background: DEEP_PURPLE,
              color: "white",
              padding: "8px 14px",
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Open
          </a>
        </div>
      </div>

      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "22px 16px 60px" }}>
        {/* Profile Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              width={80}
              height={80}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{displayName(profile)}</div>
              <div style={{ opacity: 0.6, marginTop: 4 }}>@{profile.username}</div>
            </div>
          </div>

          {profile.bio && (
            <div style={{ marginTop: 16, lineHeight: 1.6 }}>{profile.bio}</div>
          )}

          <div style={{ marginTop: 18 }}>
            <PublicProfileActions deepLink={deepLink} />
          </div>
        </div>

        {/* Feed */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {feed.map((item, i) => {
            if (item.type === "prompt") {
              return (
                <div key={i} style={cardStyle}>
                  <div style={{ fontWeight: 800, color: BRAND_PURPLE }}>
                    {item.item.question}
                  </div>
                  <div style={{ marginTop: 8 }}>{item.item.answer}</div>
                </div>
              );
            }

            const m = item.item as UserMedia;
            const url = buildPublicMediaUrl(m.storage_path);

            return (
              <div key={i} style={cardStyleNoPad}>
                <PublicMediaCard
                  type={m.media_type}
                  url={url}
                  caption={m.caption}
                  poster={
                    m.thumbnail_url ||
                    (m.thumbnail_path ? buildPublicMediaUrl(m.thumbnail_path) : null)
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

/* ---------------- Card Styles ---------------- */

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: CARD_RADIUS,
  padding: 20,
  boxShadow: "0 8px 28px rgba(0,0,0,0.05)",
};

const cardStyleNoPad: React.CSSProperties = {
  background: "white",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  boxShadow: "0 8px 28px rgba(0,0,0,0.05)",
};
