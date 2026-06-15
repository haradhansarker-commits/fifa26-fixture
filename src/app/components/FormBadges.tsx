export function FormBadges({ form, size = 18 }: { form: ("W" | "D" | "L")[]; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {form.map((r, i) => {
        const bg =
          r === "W"
            ? "var(--chart-1)"
            : r === "L"
              ? "var(--chart-5)"
              : "var(--chart-3)";
        return (
          <span
            key={i}
            className="inline-flex items-center justify-center"
            style={{
              width: size,
              height: size,
              borderRadius: 999,
              fontFamily: "Lexend, sans-serif",
              fontSize: "10px",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--primary-foreground)",
              background: bg,
            }}
            title={r === "W" ? "Win" : r === "L" ? "Loss" : "Draw"}
          >
            {r}
          </span>
        );
      })}
    </div>
  );
}
