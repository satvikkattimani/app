import { motion } from "framer-motion";
import { Sprout, Repeat, Target, Landmark, ShieldCheck, CalendarClock } from "lucide-react";

const services = [
  {
    icon: Sprout,
    title: "SIP Planning",
    text: "Disciplined, automated investing calibrated to your income rhythm and ambitions — from your first SIP to a sophisticated multi-fund ladder.",
    tall: true,
  },
  {
    icon: Repeat,
    title: "Portfolio Review & Restructuring",
    text: "A forensic look at what you hold. We prune underperformers, rebalance allocation and realign everything to your goals.",
  },
  {
    icon: Target,
    title: "Goal-Based Investing",
    text: "Education, a home, retirement — each goal gets its own roadmap, timeline and fund strategy.",
  },
  {
    icon: Landmark,
    title: "Tax-Efficient Investing",
    text: "ELSS and smart structuring so more of what you earn stays yours, within the rules.",
  },
  {
    icon: ShieldCheck,
    title: "Wealth Preservation",
    text: "Debt and hybrid strategies for capital you've already built and intend to protect.",
  },
  {
    icon: CalendarClock,
    title: "Ongoing Advisory",
    text: "Periodic reviews, rebalancing nudges and a direct line to Satvik as markets and life evolve.",
  },
];

export const Services = () => {
  return (
    <section id="services" data-testid="services-section" className="py-28 lg:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Services</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-6 leading-tight">
            Everything your portfolio
            <br />
            <span className="italic text-[#E6D5B8]">quietly needs.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12 }}
              data-testid={`service-card-${i}`}
              className={`group bg-[#121212] border border-white/10 p-10 hover:border-white/20 hover:-translate-y-1 transition-[border-color,transform] duration-500 ${
                s.tall ? "lg:row-span-2 flex flex-col justify-between" : ""
              }`}
            >
              <div>
                <s.icon size={26} className="text-[#D4AF37]" />
                <h3 className="font-serif text-2xl text-white mt-6">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mt-4">{s.text}</p>
              </div>
              {s.tall && (
                <a
                  href="#booking"
                  data-testid="service-sip-cta"
                  className="mt-10 inline-flex w-fit rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-6 py-2.5 hover:bg-[#D4AF37] hover:text-black transition-colors duration-300"
                >
                  Start a SIP conversation
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
