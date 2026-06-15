import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="px-6 py-2 flex items-center">
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="text-foreground hover:opacity-80 transition-opacity"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
      </div>
      <div className="px-6 pt-2 pb-4">
        <h1
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-weight-bold)",
            lineHeight: "32px",
            color: "var(--foreground)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: "Lexend, sans-serif",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-normal)",
              marginTop: 4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-muted-foreground px-1"
      style={{
        fontFamily: "Lexend, sans-serif",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--font-weight-semibold)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </h2>
  );
}
