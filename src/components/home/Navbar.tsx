import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "#top" },
  { label: "Candidates", href: "#candidates" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

export function Navbar({ onStart }: { onStart: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 -mx-5 px-5 transition-all md:-mx-8 md:px-8 ${
        scrolled ? "glass-panel border-x-0 border-t-0 shadow-lg shadow-background/40" : "border-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <span className="truncate font-display text-base font-bold md:text-lg">AI Interview Coach</span>
        </a>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <button
            onClick={onStart}
            className="ml-2 hidden rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Start Interview
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="grid size-10 place-items-center rounded-xl border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass-panel mx-auto mb-3 max-w-6xl rounded-2xl p-2 lg:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onStart();
            }}
            className="mt-1 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:hidden"
          >
            Start Interview
          </button>
        </div>
      )}
    </header>
  );
}