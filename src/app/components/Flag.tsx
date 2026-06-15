import { useState } from "react";

// FIFA serves a flag image per 3-letter team code, covering all 48 teams.
//   https://api.fifa.com/api/v3/picture/flags-sq-{size}/{CODE}
const flagUrl = (code: string) => `https://api.fifa.com/api/v3/picture/flags-sq-4/${code.toUpperCase()}`;

export function Flag({
  code,
  name,
  size = 24,
}: {
  code: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = code && !failed;

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 overflow-hidden bg-muted"
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-sm, 4px)",
        boxShadow: "inset 0 0 0 1px var(--border)",
      }}
      aria-label={`${name} flag`}
    >
      {showImg ? (
        <img
          src={flagUrl(code)}
          alt={`${name} flag`}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <span
          style={{
            fontSize: Math.max(8, Math.floor(size * 0.4)),
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--foreground)",
          }}
        >
          {code || "?"}
        </span>
      )}
    </span>
  );
}
