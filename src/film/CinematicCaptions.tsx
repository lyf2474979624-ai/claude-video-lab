import type {Caption} from "@remotion/captions";
import {createTikTokStyleCaptions} from "@remotion/captions";
import {useMemo} from "react";
import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export const CinematicCaptions: React.FC<{captions: Caption[]}> = ({
  captions,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: 800,
      }).pages,
    [captions],
  );
  const currentTimeMs = (frame / fps) * 1000;
  const page = pages.find(
    (candidate) =>
      currentTimeMs >= candidate.startMs &&
      currentTimeMs < candidate.startMs + candidate.durationMs,
  );

  if (!page) {
    return null;
  }

  const opacity = interpolate(
    currentTimeMs,
    [
      page.startMs,
      page.startMs + 160,
      page.startMs + page.durationMs - 180,
      page.startMs + page.durationMs,
    ],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const rise = interpolate(
    currentTimeMs,
    [page.startMs, page.startMs + 220],
    [12, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 310,
        right: 310,
        bottom: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        translate: `0px ${rise}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 19,
          maxWidth: 1160,
          padding: "12px 30px 14px",
          color: "rgba(248,251,255,0.96)",
          fontFamily:
            'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
          fontSize: 32,
          fontWeight: 430,
          lineHeight: 1.45,
          letterSpacing: 2,
          textAlign: "center",
          textWrap: "balance",
          whiteSpace: "pre-wrap",
          background:
            "linear-gradient(90deg, transparent, rgba(0,0,0,.42) 16%, rgba(0,0,0,.50) 50%, rgba(0,0,0,.42) 84%, transparent)",
          textShadow: "0 2px 16px rgba(0,0,0,.95), 0 0 22px rgba(93,226,255,.18)",
        }}
      >
        <span
          style={{
            width: 28,
            height: 1,
            flex: "0 0 auto",
            background: "rgba(127,239,255,.78)",
            boxShadow: "0 0 9px rgba(127,239,255,.56)",
          }}
        />
        <span>{page.text.trim()}</span>
      </div>
    </div>
  );
};
