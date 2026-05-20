export function Nav() {
  const links = [
    { href: "#packages", label: "Packages" },
    { href: "#drone", label: "Drone" },
    { href: "#gallery", label: "Gallery" },
    { href: "#about", label: "Festival" },
    { href: "#book", label: "Book" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-background/40 border-b border-border/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-gradient-gold">Aambal</span>
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground hidden sm:block">
            Vasantham Studio
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#book"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition glow-gold"
        >
          Reserve
        </a>
      </div>
    </header>
  );
}
