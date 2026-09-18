"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AMBIENT AUDIO.
 *
 * Autoplay policy: an AudioContext created before a user gesture starts
 * "suspended" and silently never plays. So nothing is constructed until the
 * toggle is clicked — not on mount, not on hover.
 *
 * Fade is done on a GainNode, not on audio.volume. Setting .volume in a
 * setInterval steps in discrete jumps you can hear as zipper noise;
 * linearRampToValueAtTime is sample-accurate and costs nothing.
 *
 * The file is optional. If /audio/ambient.mp3 is absent the toggle disables
 * itself rather than throwing — a missing asset must not break the page.
 */

/* Ogg Vorbis first: MP3 carries ~50ms of encoder delay and padding, so a
   looping MP3 has an audible seam at the loop point. Vorbis is gapless. MP3
   stays as the fallback for anything that cannot decode Vorbis. */
const SOURCES = ["/audio/ambient.ogg", "/audio/ambient.mp3"];

function pickSource(): string {
  if (typeof document === "undefined") return SOURCES[1];
  const probe = document.createElement("audio");
  return probe.canPlayType("audio/ogg; codecs=vorbis") ? SOURCES[0] : SOURCES[1];
}
const FADE_SECONDS = 3;
const TARGET_GAIN = 0.32;

export function SoundController() {
  const [on, setOn] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  /* Probe for the file without downloading it. */
  useEffect(() => {
    let alive = true;
    fetch(pickSource(), { method: "HEAD" })
      .then((r) => alive && setAvailable(r.ok))
      .catch(() => alive && setAvailable(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  const toggle = async () => {
    if (available === false) return;

    /* first click: build the graph */
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const audio = new Audio(pickSource());
      audio.loop = true;
      audio.crossOrigin = "anonymous";

      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(ctx.destination);

      ctxRef.current = ctx;
      audioRef.current = audio;
      gainRef.current = gain;
    }

    const ctx = ctxRef.current!;
    const gain = gainRef.current!;
    const audio = audioRef.current!;

    /* resume() must happen inside the gesture handler or Safari ignores it */
    if (ctx.state === "suspended") await ctx.resume();

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);

    if (!on) {
      try {
        await audio.play();
      } catch {
        setAvailable(false);
        return;
      }
      gain.gain.linearRampToValueAtTime(TARGET_GAIN, now + FADE_SECONDS);
      setOn(true);
    } else {
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
      window.setTimeout(() => audio.pause(), 850);
      setOn(false);
    }
  };

  const disabled = available === false;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={on}
      aria-label={`Ambient sound ${on ? "on" : "off"}`}
      className="pointer-events-auto t-micro-ed whitespace-nowrap"
      style={{
        color: "var(--chrome-ink, #FFFFFF)",
        letterSpacing: "var(--tracking-luxe)",
        mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"],
        background: "none",
        border: "none",
        padding: 0,
        borderRadius: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1,
      }}
      title={disabled ? "No ambient track installed" : undefined}
    >
      Sound [{on ? "on" : "off"}]
    </button>
  );
}
