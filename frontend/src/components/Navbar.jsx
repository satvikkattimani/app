import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const links = [
  { label: "Edge", href: "#about" },
  { label: "Chapters", href: "#services" },
  { label: "SIP Engine", href: "#sip" },
  { label: "Direct vs Regular", href: "#plans" },
  { label: "Stories", href: "#testimonials" },
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
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 border-b ${
        scrolled ? "bg-navy/85 backdrop-blur-xl border-copper/20 shadow-[0_10px_40px_rgba(7,13,24,0.35)]" : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#top" data-testid="nav-brand" aria-label="Satvik Capital home">
          <Logo size={40} />
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="copper-underline text-[13px] text-white/70 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#booking"
            data-testid="nav-book-consultation-btn"
            className="bg-copper text-white text-[13px] font-medium px-6 py-2.5 hover:bg-copper-glow transition-colors duration-300 shadow-[0_4px_20px_rgba(199,106,61,0.28)]"
          >
            Book a Consultation
          </a>
        </nav>
        <button data-testid="nav-mobile-menu-btn" className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-navy/95 backdrop-blur-2xl border-t border-copper/20 px-6 py-8 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setOpen(false)}
              className="font-serif text-2xl text-white/80 hover:text-copper-glow transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#booking" data-testid="nav-mobile-book-btn" onClick={() => setOpen(false)} className="bg-copper text-white text-sm font-medium px-6 py-3 text-center mt-2">
            Book a Consultation
          </a>
        </div>
      )}
    </header>
  );
};
