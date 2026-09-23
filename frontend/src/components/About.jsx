import { motion } from "framer-motion";
import { GraduationCap, FlaskConical, Handshake } from "lucide-react";

const PORTRAIT = "https://images.pexels.com/photos/36879437/pexels-photo-36879437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const edges = [
  {
    icon: GraduationCap,
    title: "Bachelor's in Investment Banking",
    text: "Formal training in valuation, capital markets and portfolio theory, the grammar behind every allocation decision made for you.",
  },
  {
    icon: FlaskConical,
    title: "Inside the AMC engine room",
    text: "Interned at an asset management company on the ideation and execution of mutual fund products. Your advisor has seen how a fund is conceived, stress-tested and launched, and reads a scheme document the way its author intended.",
  },
  {
    icon: Handshake,
    title: "The edge you actually feel",
    text: "Most advisors compare funds from the outside. Your advisor evaluates mandate, manager conviction and portfolio construction from the inside, then holds your hand through the market's mood swings.",
  },
];

const reveal = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" } };

export const About = () => (
  <section id="about" data-testid="about-section" className="relative py-28 lg:py-40 bg-navy-deep text-white overflow-hidden">
    <div className="absolute inset-0 nav-grid opacity-50" />
    <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-14 lg:gap-10 items-start">
      <motion.div {...reveal} transition={{ duration: 0.9 }} className="lg:col-span-5 lg:sticky lg:top-32">
        <div className="relative">
          <div className="absolute -inset-3 border border-copper/40 -translate-x-4 translate-y-4 pointer-events-none" />
          <img
            src={PORTRAIT}
            alt="Your financial advisor"
            data-testid="about-portrait"
            className="relative w-full aspect-[4/5] object-cover sepia-[0.2] contrast-[1.05]"
          />
          <div className="absolute -bottom-8 -right-4 sm:right-8 w-28 h-28 rounded-full bg-copper text-white flex flex-col items-center justify-center shadow-[0_12px_30px_rgba(199,106,61,0.35)] rotate-[-8deg]">
            <img src="/brand/logo.png" alt="" className="w-10 h-10 brightness-0 invert" />
            <span className="font-mono text-[8px] uppercase tracking-[0.25em] mt-1">Est. 2026</span>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35 mt-14">Portrait placeholder, to be replaced with the advisor's photograph</p>
      </motion.div>

      <div className="lg:col-span-6 lg:col-start-7">
        <motion.div {...reveal} transition={{ duration: 0.8 }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper-glow font-medium">01 · The Advisor</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            Not a seller of funds.
            <br />
            <span className="italic text-copper-glow">A builder of them.</span>
          </h2>
          <p className="text-white/65 text-base sm:text-lg leading-relaxed mt-8 font-light">
            Your advisor holds a Bachelor's degree in Investment Banking and spent formative
            months inside an asset management company, working on how mutual funds are ideated,
            structured and executed before they ever reach an investor's screen.
          </p>
          <p className="text-white/65 text-base sm:text-lg leading-relaxed mt-5 font-light">
            That vantage point is the edge. A portfolio review here is not a read of a star
            rating, it is a read of the fund the way the people who built it do. Satvik Capital
            exists so families and professionals can borrow that lens.
          </p>
        </motion.div>

        <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {edges.map((e, i) => (
            <motion.div
              key={e.title}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              data-testid={`about-edge-${i}`}
              className="group grid grid-cols-[auto_1fr] gap-6 py-8"
            >
              <span className="w-12 h-12 border border-copper/40 flex items-center justify-center text-copper-glow group-hover:bg-copper group-hover:text-white transition-colors duration-500">
                <e.icon size={20} />
              </span>
              <div>
                <h3 className="font-serif text-2xl">{e.title}</h3>
                <p className="text-white/60 text-sm sm:text-[15px] leading-relaxed mt-2 font-light">{e.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
