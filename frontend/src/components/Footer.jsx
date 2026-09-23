import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer data-testid="site-footer" className="bg-navy-abyss text-[#94A3B8] pt-20 lg:pt-28 pb-10 relative overflow-hidden">
    <img src="/brand/logo.png" alt="" aria-hidden className="absolute -bottom-32 -left-24 w-[420px] opacity-[0.05] pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <Logo size={48} />
          <p className="text-sm leading-relaxed mt-8 max-w-sm font-light">
            A capital advisory practice serving families and professionals who value discretion, discipline and a direct line.
          </p>
          <p className="font-scripts text-copper-glow text-xl mt-6">सत्येन धार्यते धनम्</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35 mt-1">Wealth is held by truth</p>
        </div>
        <div className="lg:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Reach your advisor</p>
          <div className="mt-6 space-y-3 text-sm">
            <p data-testid="footer-phone"><a href="tel:+919740542188" className="hover:text-copper-glow transition-colors duration-300">+91 97405 42188</a></p>
            <p data-testid="footer-email" className="break-all"><a href="mailto:satvikkinvestments@gmail.com" className="hover:text-copper-glow transition-colors duration-300">satvikkinvestments@gmail.com</a></p>
            <p className="text-white/35">Monday to Saturday · 10 AM to 7 PM IST</p>
          </div>
        </div>
        <div className="lg:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Navigate</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {[["Edge", "#about"], ["Chapters", "#services"], ["SIP Engine", "#sip"], ["AI vs Direct vs Regular", "#plans"], ["Book", "#booking"], ["Stories", "#testimonials"]].map(([l, h]) => (
              <a key={l} href={h} data-testid={`footer-link-${l.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-copper-glow transition-colors duration-300">{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="deckle mt-16 pt-10">
        <p data-testid="footer-disclaimer" className="text-white/35 text-xs leading-relaxed max-w-4xl font-light">
          Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future returns. Calculators and comparisons on this website are illustrative and do not constitute investment advice or an offer to buy or sell any securities.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
          <p data-testid="footer-arn" className="text-white/40 text-xs">
            © {new Date().getFullYear()} Satvik Capital · SATVIK DEEPAK KATTIMANI · AMFI Registered Mutual Fund Distributor · <span className="text-copper-glow">ARN-349743</span>
          </p>
          <a href="/admin/login" data-testid="footer-admin-link" className="text-white/25 text-xs hover:text-white/60 transition-colors duration-300">Advisor Login</a>
        </div>
      </div>
    </div>
  </footer>
);
