import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";

const LINES = ["Navigating volatile tides.", "Anchoring generational wealth."];

const MaskedLine = ({ text, delay, italic }) => (
  <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
    <motion.span
      className={`block ${italic ? "italic text-copper-glow" : ""}`}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  </span>
);

export const Hero = ({ ready }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const base = ready ? 0.2 : 0;

  return (
    <section id="top" ref={ref} data-testid="hero-section" className="relative min-h-screen bg-navy text-white overflow-hidden flex items-end">
      <div className="absolute inset-0 nav-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(199,106,61,0.22),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-navy to-transparent" />

      <motion.img
        src="/brand/logo.png"
        alt=""
        aria-hidden
        style={{ rotate, y }}
        className="absolute -right-[10vw] top-[8vh] w-[70vw] max-w-[820px] opacity-[0.16] pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={ready ? { opacity: 0.16, scale: 1 } : {}}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-28 pt-44 w-full">
        <motion.p
          data-testid="hero-overline"
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-copper-glow flex items-center gap-3"
          initial={{ opacity: 0, x: -14 }}
          animate={ready ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: base }}
        >
          <Compass size={14} /> The personal financial advisory practice of Satvik Kattimani
        </motion.p>

        {ready && (
          <h1 data-testid="hero-heading" className="font-serif font-light text-5xl sm:text-6xl lg:text-7xl xl:text-[5.6rem] leading-[1.02] mt-10 tracking-tight max-w-4xl">
            {LINES.map((l, i) => <MaskedLine key={l} text={l} delay={base + 0.15 + i * 0.18} italic={i === 1} />)}
          </h1>
        )}

        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-end mt-12">
          <motion.p
            data-testid="hero-subtext"
            className="text-white/65 text-base sm:text-lg leading-relaxed max-w-xl font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: base + 0.7 }}
          >
            Portfolios built the way funds are built inside an asset management house — with
            conviction, structure and a steady hand. SIP planning, portfolio restructuring and
            goal-based investing, personally guided by Satvik.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: base + 0.85 }}
          >
            <a
              href="#booking"
              data-testid="hero-book-consultation-btn"
              className="group bg-copper text-white font-medium px-8 py-4 flex items-center gap-3 hover:bg-copper-glow transition-colors duration-300 shadow-[0_4px_24px_rgba(199,106,61,0.3)]"
            >
              Book a Free Consultation
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#sip" data-testid="hero-sip-calculator-btn" className="border border-copper/60 text-copper-glow px-8 py-4 hover:bg-copper hover:text-white transition-colors duration-300">
              Calculate SIP Growth
            </a>
          </motion.div>
        </div>

        <motion.div
          data-testid="hero-ribbon"
          className="deckle mt-20 pt-6 flex flex-wrap gap-x-10 gap-y-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: base + 1.2 }}
        >
          <span>Bachelor's · Investment Banking</span>
          <span>AMC-trained in fund construction</span>
          <span>One advisor, direct line</span>
          <span>+91 97405 42188</span>
        </motion.div>
      </motion.div>
    </section>
  );
};
