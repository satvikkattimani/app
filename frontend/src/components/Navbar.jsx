import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color] duration-500 border-b ${
        scrolled ? "bg-[#0A0A0A]/70 backdrop-blur-2xl border-white/10" : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#top" data-testid="nav-brand" className="flex flex-col leading-none">
          <span className="font-serif text-xl text-white tracking-wide">Satvik Kattimani</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mt-1">Wealth &amp; Investments</span>
        </a>
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="gold-underline text-sm text-white/70 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#booking"
            data-testid="nav-book-consultation-btn"
            className="rounded-full bg-[#D4AF37] text-black text-sm font-medium px-6 py-2.5 hover:bg-[#E6D5B8] transition-colors duration-300"
          >
            Book Consultation
          </a>
        </nav>
        <button
          data-testid="nav-mobile-menu-btn"
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-sm tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#booking"
            data-testid="nav-mobile-book-btn"
            onClick={() => setOpen(false)}
            className="rounded-full bg-[#D4AF37] text-black text-sm font-medium px-6 py-2.5 text-center"
          >
            Book Consultation
          </a>
        </div>
      )}
    </header>
  );
};
