import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";

export function Layout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  // Restore scroll for this history entry, save on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const key = `scroll:${location.key}`;

    const saved = sessionStorage.getItem(key);
    if (saved) {
      el.scrollTop = parseInt(saved, 10);
    } else {
      el.scrollTop = 0;
    }

    const onScroll = () => sessionStorage.setItem(key, String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [location.key]);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
