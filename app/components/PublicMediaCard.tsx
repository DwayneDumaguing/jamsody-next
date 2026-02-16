"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type MediaType = "image" | "video" | "audio";

export default function PublicMediaCard(props: {
  type: MediaType;
  url: string;
  poster?: string | null;
  caption?: string | null;
}) {
  const t = props.type;

  if (t === "image") return <ImageCard url={props.url} caption={props.caption} />;
  if (t === "video") return <VideoCard url={props.url} poster={props.poster} />;
  return <AudioCard url={props.url} caption={props.caption} />;
}
function VideoCard({ url, poster }: { url: string; poster?: string | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [showVol, setShowVol] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // iOS autoplay requirements
    el.muted = true;
    el.volume = 0;
    el.playsInline = true;
    el.loop = true;
    el.preload = "metadata";

    let cancelled = false;

    const tryPlay = async () => {
      if (cancelled) return;
      try {
        // Some browsers need this called after muted/inline already set
        await el.play();
      } catch (_) {}
    };

    const tryPause = () => {
      try {
        el.pause();
      } catch (_) {}
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          tryPlay();
        } else {
          tryPause();
        }
      },
      { threshold: [0, 0.25, 0.6, 0.9] }
    );

    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [url]);

  const toggleMute = async () => {
    const el = ref.current;
    if (!el) return;

    const nextMuted = !muted;

    // if unmuting, pause any playing audio card
    if (!nextMuted) {
      // if you have your AudioFocus.pauseCurrent(), call it here
      // AudioFocus.pauseCurrent();
    }

    setMuted(nextMuted);
    setShowVol(true);

    el.muted = nextMuted;
    el.volume = nextMuted ? 0 : 1;

    window.setTimeout(() => setShowVol(false), 900);
  };

  return (
    <div style={{ aspectRatio: "3 / 4", background: "#eee", position: "relative" }}>
      <video
        ref={ref}
        src={url}
        poster={poster ?? undefined}
        muted
        playsInline
        controls
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          background: "#000",
        }}
        onClick={toggleMute}
      />

      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          opacity: showVol ? 1 : 0,
          transform: showVol ? "scale(1)" : "scale(0.92)",
          transition: "all 180ms ease",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 900,
          }}
        >
          {muted ? "🔇" : "🔊"}
        </div>
      </div>
    </div>
  );
}


function ImageCard({ url, caption }: { url: string; caption?: string | null }) {
  return (
    <div style={{ aspectRatio: "3 / 4", background: "#eee" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={caption ?? "Image"}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        loading="lazy"
      />
    </div>
  );
}

const AudioFocus = {
  current: null as HTMLAudioElement | null,
  setCurrent(a: HTMLAudioElement) {
    if (this.current && this.current !== a) {
      try {
        this.current.pause();
      } catch (_) {}
    }
    this.current = a;
  },
  pauseCurrent() {
    if (this.current) {
      try {
        this.current.pause();
      } catch (_) {}
      this.current = null;
    }
  },
};

function AudioCard({ url, caption }: { url: string; caption?: string | null }) {
  const title = (caption ?? "").trim() || "Audio";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const bars = useMemo(() => {
    const seed = hash(url);
    return Array.from({ length: 28 }).map((_, i) => {
      const v = (Math.sin((seed + i) * 1.7) + 1) / 2;
      return 0.25 + v * 0.75;
    });
  }, [url]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);

    const wrapper = a.closest("[data-audio-wrap]") as HTMLElement | null;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e.isIntersecting || e.intersectionRatio < 0.5) {
          try {
            if (!a.paused) a.pause();
          } catch (_) {}
        }
      },
      { threshold: [0, 0.5, 0.8] }
    );

    if (wrapper) io.observe(wrapper);

    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      io.disconnect();
    };
  }, []);

  const onToggle = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      if (a.paused) {
        AudioFocus.setCurrent(a);
        await a.play();
      } else {
        a.pause();
      }
    } catch (_) {}
  };

  return (
    <div
      data-audio-wrap
      style={{
        aspectRatio: "1 / 1",
        background: "linear-gradient(135deg, #2B0A3D, #6D28D9)",
        padding: 20,
        color: "white",
        position: "relative",
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
            fontWeight: 900,
          }}
        >
          🎧
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.72)" }}>
            {playing ? "Playing…" : "Tap to play"}
          </div>
        </div>
      </div>

      <button
        onClick={onToggle}
        style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer" }}
        aria-label={playing ? "Pause audio" : "Play audio"}
      />

      <div
        style={{
          marginTop: 18,
          borderRadius: 20,
          padding: "18px 14px",
          background: "rgba(0,0,0,0.18)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "flex-end" }}>
          {bars.map((b, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 70 * b,
                borderRadius: 999,
                background: "rgba(255,255,255,0.86)",
                transformOrigin: "bottom",
                animation: playing ? `jamWave 900ms ease-in-out ${i * 35}ms infinite alternate` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, position: "relative", zIndex: 2 }}>
        <audio
          ref={audioRef}
          controls
          style={{ width: "100%" }}
          preload="none"
          onPlay={() => {
            if (audioRef.current) AudioFocus.setCurrent(audioRef.current);
          }}
        >
          <source src={url} />
        </audio>
      </div>

      <style jsx>{`
        @keyframes jamWave {
          0% {
            transform: scaleY(0.7);
          }
          100% {
            transform: scaleY(1.05);
          }
        }
      `}</style>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}
