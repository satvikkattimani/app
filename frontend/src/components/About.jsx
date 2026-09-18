import { motion } from "framer-motion";
import { GraduationCap, FlaskConical, Handshake } from "lucide-react";

const PORTRAIT = "https://images.pexels.com/photos/36879437/pexels-photo-36879437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const edges = [
  {
    icon: GraduationCap,
    title: "Bachelor's in Investment Banking",
    text: "Formal training in valuation, capital markets and portfolio theory — the grammar behind every allocation decision I make for you.",
  },
  {
    icon: FlaskConical,
    title: "Inside the AMC engine room",
    text: "Interned at an asset management company on the ideation and execution of mutual fund products. I have seen how a fund is conceived, stress-tested and launched — so I read a scheme document the way its author intended.",
  },
  {
    icon: Handshake,
    title: "The edge you actually feel",
    text: "Most advisors compare funds from the outside. I evaluate mandate, manager conviction and portfolio construction from the inside — then hold your hand through the market's mood swings.",
  },
];

const reveal = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" } };

export const About = () => (
  <section id="about" data-testid="about-section" className="relative py-28 lg:py-40 bg-paper text-ink overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-14 lg:gap-10 items-start">
      <motion.div {...reveal} transition={{ duration: 0.9 }} className="lg:col-span-5 lg:sticky lg:top-32">
        <div className="relative">
          <div className="absolute -inset-3 border border-copper/40 -translate-x-4 translate-y-4 pointer-events-none" />
          <img
            src={PORTRAIT}
            alt="Satvik Kattimani, Financial Advisor"
            data-testid="about-portrait"
            className="relative w-full aspect-[4/5] object-cover sepia-[0.25] contrast-[1.05]"
          />
          <div className="absolute -bottom-8 -right-4 sm:right-8 w-28 h-28 rounded-full bg-copper text-white flex flex-col items-center justify-center shadow-[0_12px_30px_rgba(199,106,61,0.35)] rotate-[-8deg]">
            <img src="/brand/logo.png" alt="" className="w-10 h-10 brightness-0 invert" />
            <span className="font-mono text-[8px] uppercase tracking-[0.25em] mt-1">Est. 2026</span>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3 mt-14">Portrait placeholder · to be replaced with Satvik's photograph</p>
      </motion.div>

      <div className="lg:col-span-6 lg:col-start-7">
        <motion.div {...reveal} transition={{ duration: 0.8 }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper font-medium">01 — The Advisor</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            Not a seller of funds.
            <br />
            <span className="italic text-copper">A builder of them.</span>
          </h2>
          <p className="text-ink-2 text-base sm:text-lg leading-relaxed mt-8 font-light">
            I'm Satvik Kattimani, founder of Satvik Capital and your financial advisor. I hold a
            Bachelor's degree in Investment Banking and spent my formative months inside an
            asset management company, working on how mutual funds are ideated, structured and
            executed before they ever reach an investor's screen.
          </p>
          <p className="text-ink-2 text-base sm:text-lg leading-relaxed mt-5 font-light">
            That vantage point is my edge. When I review your portfolio, I'm not reading a
            star rating — I'm reading the fund the way the people who built it do. Satvik
            Capital exists so a select circle of families and professionals can borrow that lens.
          </p>
        </motion.div>

        <div className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
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
              <span className="w-12 h-12 border border-copper/40 flex items-center justify-center text-copper group-hover:bg-copper group-hover:text-white transition-colors duration-500">
                <e.icon size={20} />
              </span>
              <div>
                <h3 className="font-serif text-2xl">{e.title}</h3>
                <p className="text-ink-2 text-sm sm:text-[15px] leading-relaxed mt-2 font-light">{e.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
