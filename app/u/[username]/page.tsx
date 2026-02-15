import { createClient } from "@supabase/supabase-js";

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

  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, username, first_name, last_name, avatar_url, bio, profile_bio, location")
    .ilike("username", uname) // ✅ case-insensitive match
    .single();

  if (error || !data) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Profile not found</h1>
        <pre>{JSON.stringify({ uname, error }, null, 2)}</pre>
      </main>
    );
  }

  const displayName =
    (data.first_name && data.last_name)
      ? `${data.first_name} ${data.last_name}`
      : data.username;

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <img
          src={data.avatar_url || "/default-avatar.png"}
          alt="avatar"
          width={96}
          height={96}
          style={{ borderRadius: 999, objectFit: "cover" }}
        />
        <div>
          <h1 style={{ margin: 0 }}>{displayName}</h1>
          <div style={{ opacity: 0.7 }}>@{data.username}</div>
          <div style={{ opacity: 0.7 }}>{data.location || ""}</div>
        </div>
      </div>

      <p style={{ marginTop: 16 }}>
        {data.profile_bio || data.bio || ""}
      </p>
    </main>
  );
}
