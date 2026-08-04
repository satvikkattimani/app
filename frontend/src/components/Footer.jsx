import { ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer data-testid="site-footer" className="bg-[#0A0A0A] border-t border-white/10 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-3 gap-16">
          <div>
            <p className="font-serif text-3xl text-white">Satvik Kattimani</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mt-2">Wealth &amp; Investments</p>
            <p className="text-white/50 text-sm leading-relaxed mt-6 max-w-sm">
              A private mutual fund distribution practice serving families and
              professionals who value discretion, discipline and direct access.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Reach me</p>
            <div className="mt-6 space-y-3 text-sm">
              <p data-testid="footer-phone" className="text-white/70">
                <a href="tel:+919740542188" className="hover:text-white transition-colors duration-300">+91 97405 42188</a>
              </p>
              <p data-testid="footer-email" className="text-white/70 break-all">
                <a href="mailto:satvikkinvestments@gmail.com" className="hover:text-white transition-colors duration-300">satvikkinvestments@gmail.com</a>
              </p>
              <p className="text-white/40">Monday – Saturday · 10 AM – 7 PM IST</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Registration</p>
            <div className="mt-6 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#D4AF37] mt-0.5 shrink-0" />
              <p data-testid="footer-arn" className="text-white/70 text-sm leading-relaxed">
                AMFI-Registered Mutual Fund Distributor
                <br />
                <span className="text-[#E6D5B8] font-medium">ARN-349743</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-10">
          <p data-testid="footer-disclaimer" className="text-white/30 text-xs leading-relaxed max-w-4xl">
            Mutual Fund investments are subject to market risks. Please read all scheme-related
            documents carefully before investing. Past performance is not indicative of future
            returns. This website is for information and education only and does not constitute
            investment advice or an offer to buy/sell any securities.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
            <p className="text-white/30 text-xs">© {new Date().getFullYear()} Satvik Kattimani. All rights reserved.</p>
            <a href="/admin/login" data-testid="footer-admin-link" className="text-white/20 text-xs hover:text-white/50 transition-colors duration-300">
              Client Advisor Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
