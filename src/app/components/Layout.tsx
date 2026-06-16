import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

export function Layout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  // Restore scroll for this history entry, save on scroll. Content often loads
  // asynchronously (skeletons → data), so the saved position isn't reachable on
  // the first frame. A ResizeObserver re-applies it as the content grows tall
  // enough, and we ignore our own programmatic scrolls so the user can take over.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const key = `scroll:${location.key}`;
    const saved = parseInt(sessionStorage.getItem(key) ?? "0", 10);

    let settled = false;
    let restoring = false;
    const maxScroll = () => el.scrollHeight - el.clientHeight;

    const attempt = () => {
      if (settled) return;
      const target = saved > 0 ? saved : 0;
      restoring = true;
      el.scrollTop = target;
      restoring = false;
      if (target === 0 || maxScroll() >= target - 1) {
        settled = true;
        ro.disconnect();
      }
    };

    const ro = new ResizeObserver(attempt);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    attempt();
    const stop = window.setTimeout(() => {
      settled = true;
      ro.disconnect();
    }, 2000);

    const onScroll = () => {
      if (restoring) return; // ignore programmatic restores
      settled = true; // user has taken over
      sessionStorage.setItem(key, String(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      settled = true;
      ro.disconnect();
      window.clearTimeout(stop);
      el.removeEventListener("scroll", onScroll);
    };
  }, [location.key]);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
