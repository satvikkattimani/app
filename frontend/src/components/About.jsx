import { motion } from "framer-motion";
import { BadgeCheck, LineChart, Handshake } from "lucide-react";

const PORTRAIT =
  "https://images.unsplash.com/photo-1764546899196-b53061b1b609?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBJbmRpYW4lMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwZGFyayUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzg1ODM3OTU2fDA&ixlib=rb-4.1.0&q=85";

const pillars = [
  { icon: BadgeCheck, title: "Registered & Regulated", text: "AMFI-registered distributor, ARN-349743. Every recommendation within SEBI's framework." },
  { icon: LineChart, title: "Goal-First Approach", text: "Portfolios built around your milestones — not around products." },
  { icon: Handshake, title: "One Point of Contact", text: "You deal directly with Satvik. No call centres, no hand-offs." },
];

export const About = () => {
  return (
    <section id="about" data-testid="about-section" className="py-28 lg:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">About</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-6 leading-tight">
            A personal practice,
            <br />
            <span className="italic text-[#E6D5B8]">not a product desk.</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mt-8">
            I'm Satvik Kattimani — a SEBI-registered, AMFI-certified Mutual Fund
            Distributor. I began this practice in 2026 with a simple conviction:
            wealth advice should feel like a private conversation, not a sales pitch.
          </p>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mt-5">
            I work with a select circle of families and professionals, reviewing
            portfolios, restructuring what isn't working, and building disciplined
            SIP strategies around the goals that matter to you.
          </p>
          <div className="mt-12 space-y-8">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="flex gap-5"
                data-testid={`about-pillar-${i}`}
              >
                <p.icon size={20} className="text-[#D4AF37] mt-1 shrink-0" />
                <div>
                  <h3 className="text-white font-medium">{p.title}</h3>
                  <p className="text-white/50 text-sm mt-1 leading-relaxed">{p.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="relative lg:translate-y-10"
        >
          <div className="absolute -inset-4 border border-[#D4AF37]/20 translate-x-6 translate-y-6" />
          <img
            src={PORTRAIT}
            alt="Satvik Kattimani"
            data-testid="about-portrait"
            className="relative w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-[filter] duration-700"
          />
          <div className="absolute bottom-6 left-6 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 px-6 py-4">
            <p className="font-serif text-xl text-white">Satvik Kattimani</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mt-1">Mutual Fund Distributor · ARN-349743</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
