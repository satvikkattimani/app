import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const chapters = [
  {
    n: "I",
    title: "Portfolio Architecture",
    lead: "The blueprint before the bricks.",
    text: "A forensic read of what you already hold: overlap, hidden concentration, dead weight. Then a rebuilt allocation with a written rationale you can hold your advisor to.",
    tags: ["Portfolio review", "Restructuring", "Asset allocation"],
  },
  {
    n: "II",
    title: "SIP Planning",
    lead: "Discipline, automated.",
    text: "From a first ₹5,000 SIP to a multi-fund ladder for a household, calibrated to your income rhythm, your goals and your stomach for volatility.",
    tags: ["Goal-based SIPs", "Step-up plans", "Education & retirement"],
  },
  {
    n: "III",
    title: "Fund Selection & Monitoring",
    lead: "Read the way its author intended.",
    text: "Mandates, manager conviction, portfolio construction, evaluated with an AMC-trained eye, then monitored quarterly. Tax-efficient structuring through ELSS and thoughtful holding periods is built in.",
    tags: ["Scheme due diligence", "Tax-efficient investing", "Quarterly reviews"],
  },
  {
    n: "IV",
    title: "The Human Anchor",
    lead: "One relationship. Every time.",
    text: "Markets test people more than portfolios. You get a direct line to your advisor in every drawdown and every windfall, with no call centres, no ticket numbers, no hand-offs.",
    tags: ["Direct access", "Behavioural coaching", "Ongoing advisory"],
  },
];

export const Services = () => (
  <section id="services" data-testid="services-section" className="py-28 lg:py-40 bg-navy text-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="grid lg:grid-cols-12 gap-8 items-end"
      >
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper-glow font-medium">02 · Four Chapters</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            What working together
            <br />
            <span className="italic text-copper-glow">actually looks like.</span>
          </h2>
        </div>
        <p className="lg:col-span-4 lg:col-start-9 text-white/60 text-base leading-relaxed font-light">
          A manifesto in four movements. Every client relationship at Satvik Capital moves through them, in this order, at your pace.
        </p>
      </motion.div>

      <div className="mt-20 border-t border-white/10">
        {chapters.map((c, i) => (
          <motion.article
            key={c.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.05 * i }}
            data-testid={`chapter-${i}`}
            className="group grid lg:grid-cols-12 gap-6 lg:gap-8 py-12 lg:py-14 border-b border-white/10 hover:bg-white/[0.03] transition-colors duration-500 lg:px-6 lg:-mx-6"
          >
            <span className="lg:col-span-2 font-serif text-6xl lg:text-7xl text-copper/70 leading-none group-hover:text-copper-glow transition-colors duration-500">{c.n}</span>
            <div className="lg:col-span-4">
              <h3 className="font-serif text-3xl lg:text-4xl leading-tight">{c.title}</h3>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 mt-3">{c.lead}</p>
            </div>
            <div className="lg:col-span-5">
              <p className="text-white/60 text-base leading-relaxed font-light">{c.text}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {c.tags.map((t) => (
                  <span key={t} className="font-mono text-[10px] uppercase tracking-[0.15em] border border-white/15 px-3 py-1.5 text-white/60">{t}</span>
                ))}
              </div>
            </div>
            <a href="#booking" aria-label={`Discuss ${c.title}`} data-testid={`chapter-cta-${i}`} className="lg:col-span-1 justify-self-end self-start w-11 h-11 border border-white/15 flex items-center justify-center text-white/50 group-hover:border-copper group-hover:text-copper-glow group-hover:rotate-45 transition-[transform,color,border-color] duration-500">
              <ArrowUpRight size={18} />
            </a>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
