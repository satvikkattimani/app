import { motion } from "framer-motion";

const testimonials = [
  { quote: "Satvik restructured a portfolio I had neglected for years. Within one sitting, I finally understood what I owned and why. Clarity is priceless.", name: "R. Deshmukh", role: "Entrepreneur, Belagavi" },
  { quote: "What struck me was the patience. No pushing of products — just thoughtful questions about our family's goals before a single fund was discussed.", name: "Dr. A. Kulkarni", role: "Consultant Physician" },
  { quote: "My SIPs now run like clockwork and the quarterly reviews keep me honest. It feels less like a service and more like having a private banker.", name: "S. Patil", role: "Senior Director, IT Services" },
];

export const Testimonials = () => (
  <section id="testimonials" data-testid="testimonials-section" className="py-28 lg:py-40 bg-paper-ivory text-ink">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper font-medium">07 — Client Stories</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            In their <span className="italic text-copper">own words.</span>
          </h2>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Representative stories · real client words coming soon</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            data-testid={`testimonial-card-${i}`}
            className={`bg-white border border-ink/10 p-10 flex flex-col justify-between shadow-[0_4px_24px_rgba(11,21,40,0.04)] hover:-translate-y-1 transition-transform duration-500 ${i === 1 ? "md:translate-y-10" : ""}`}
          >
            <div>
              <span className="font-serif text-6xl text-copper/50 leading-none">“</span>
              <blockquote className="font-serif text-xl leading-relaxed -mt-4 text-ink">{t.quote}</blockquote>
            </div>
            <figcaption className="mt-10 pt-6 border-t border-ink/10">
              <p className="font-medium">{t.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 mt-1">{t.role}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);
