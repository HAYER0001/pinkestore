import { ImageResponse } from "next/og";
import { MONOGRAM_PATH, MONOGRAM_TAIL } from "@/components/brand/Monogram";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon, generated from the same monogram path the site uses, so the tab
 * icon cannot drift from the wordmark.
 *
 * 64px rather than 32: browsers downscale, and a hairline monogram rendered at
 * 32 and then downscaled again on a retina tab turns to mush.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12100E",
        }}
      >
        <svg width="46" height="46" viewBox="0 0 34 34" fill="none">
          <path
            d={MONOGRAM_PATH}
            stroke="#E8BC57"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={MONOGRAM_TAIL}
            stroke="#E8BC57"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
