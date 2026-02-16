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
  booking_permission?: string | null;
};

type UserMedia = {
  id: string;
  media_type: "image" | "video" | "audio";
  storage_path: string;
  caption: string | null;
  order_index: number | null;
  thumbnail_url?: string | null;
};

const MAX_W = 680;
const CARD_RADIUS = 28;
const DEEP_PURPLE = "#2B0A3D";

/* ---------------- helpers ---------------- */

function displayName(p: PublicProfile) {
  const fn = (p.first_name ?? "").trim();
  const ln = (p.last_name ?? "").trim();
  if (!fn && !ln) return "Unnamed Musician";
  if (!fn) return ln;
  if (!ln) return fn;
  return `${fn} ${ln}`;
}

function buildPublicMediaUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/user-media/${storagePath}`;
}

/* ---------------- page ---------------- */

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

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .ilike("username", username.toLowerCase())
    .single();

  if (!profile) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Profile not found</h1>
      </main>
    );
  }

  const { data: media } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("order_index", { ascending: true });

  const deepLink = `jamsody://u/${profile.username}`;
  const name = displayName(profile);

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ===== FIXED BACKGROUND (Flutter vibe) ===== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#F4F1FB",
          zIndex: -2,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(800px 500px at 20% 10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(900px 600px at 90% 30%, rgba(124,58,237,0.15), transparent 60%)",
          zIndex: -1,
        }}
      />

      <div
        style={{
          maxWidth: MAX_W,
          margin: "0 auto",
          padding: "24px 16px 60px",
        }}
      >
        {/* ===== HEADER CARD ===== */}
        <GlassCard>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Avatar url={profile.avatar_url} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 900 }}>
                {name}
              </div>
              <div style={{ marginTop: 4, opacity: 0.7 }}>
                @{profile.username}
              </div>
              {profile.location && (
                <div style={{ marginTop: 6, opacity: 0.7 }}>
                  {profile.location}
                </div>
              )}
            </div>
          </div>

          {profile.profile_bio && (
            <div style={{ marginTop: 18, lineHeight: 1.6 }}>
              {profile.profile_bio}
            </div>
          )}

          {/* OPEN BUTTON */}
          <PublicProfileActions deepLink={deepLink} />
        </GlassCard>

        <div style={{ height: 18 }} />

        {/* ===== MEDIA FEED ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(media ?? []).map((m) => (
            <GlassCard key={m.id} clip>
              <PublicMediaCard
                type={m.media_type}
                url={buildPublicMediaUrl(m.storage_path)}
                poster={m.thumbnail_url}
                caption={m.caption}
              />
            </GlassCard>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          @{profile.username} on Jamsody
        </div>
      </div>
    </main>
  );
}

/* ---------------- UI Components ---------------- */

function GlassCard({
  children,
  clip,
}: {
  children: React.ReactNode;
  clip?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: CARD_RADIUS,
        padding: clip ? 0 : 24,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 40px rgba(17,24,39,0.06)",
        border: "1px solid rgba(17,24,39,0.06)",
        overflow: clip ? "hidden" : "visible",
      }}
    >
      {children}
    </div>
  );
}

function Avatar({ url }: { url: string | null }) {
  return (
    <div
      style={{
        width: 86,
        height: 86,
        borderRadius: 999,
        overflow: "hidden",
        background: "#E9E4F8",
        flexShrink: 0,
      }}
    >
      {url ? (
        <img
          src={url}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
    </div>
  );
}
