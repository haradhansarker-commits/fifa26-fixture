import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Youtube, ExternalLink } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  videoId: string | null;
  searchUrl: string;
};

/** In-app YouTube highlights viewer. Embeds the configured reel when one
 *  exists; otherwise offers a YouTube search (search results can't be embedded).
 *  Rendered in a portal above all app chrome with Esc / backdrop / button close. */
export function HighlightsModal({ open, onClose, title, videoId, searchUrl }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc to close, lock body scroll, and move focus to the close button while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: "var(--z-modal, 1000)", background: "rgba(0,0,0,0.78)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className="relative w-full max-w-3xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Youtube size={18} style={{ color: "var(--live)" }} aria-hidden />
                <h2
                  className="text-foreground truncate"
                  style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)" }}
                >
                  {title}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close highlights"
                className="shrink-0 inline-flex items-center justify-center rounded-full transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ width: 36, height: 36, color: "var(--foreground)" }}
              >
                <X size={20} />
              </button>
            </div>

            {videoId ? (
              <div
                className="w-full overflow-hidden rounded-2xl border border-border bg-black"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center">
                <Youtube size={32} style={{ color: "var(--live)" }} aria-hidden />
                <p className="text-foreground" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                  No embedded reel for this match yet
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-xs)", maxWidth: "42ch" }}>
                  Find the official FIFA highlights on YouTube — it opens in a new tab.
                </p>
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  <ExternalLink size={15} aria-hidden />
                  Search on YouTube
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
