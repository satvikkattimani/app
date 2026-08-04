import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1706074740295-d7a79c079562?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBtb2Rlcm4lMjBvZmZpY2UlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzg1ODM3OTU2fDA&ixlib=rb-4.1.0&q=85";

export const Hero = () => {
  return (
    <section id="top" data-testid="hero-section" className="relative min-h-screen flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32 pt-48 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p data-testid="hero-overline" className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium flex items-center gap-3">
            <ShieldCheck size={14} /> AMFI Registered · ARN-349743
          </p>
          <h1
            data-testid="hero-heading"
            className="font-serif font-light text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] mt-8 tracking-tight"
          >
            Wealth, curated
            <br />
            <span className="italic text-[#E6D5B8]">with conviction.</span>
          </h1>
          <p data-testid="hero-subtext" className="text-white/70 text-base sm:text-lg leading-relaxed mt-8 max-w-xl">
            Discerning mutual fund guidance for those who expect more from their money.
            SIP planning, portfolio restructuring and goal-based investing — personally
            managed by Satvik Kattimani.
          </p>
          <div className="flex flex-wrap items-center gap-5 mt-12">
            <a
              href="#booking"
              data-testid="hero-book-consultation-btn"
              className="group rounded-full bg-[#D4AF37] text-black font-medium px-8 py-4 flex items-center gap-3 hover:bg-[#E6D5B8] transition-colors duration-300"
            >
              Book a Free Consultation
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#services"
              data-testid="hero-explore-services-btn"
              className="rounded-full border border-white/20 text-white px-8 py-4 hover:bg-white/5 transition-colors duration-300"
            >
              Explore Services
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
