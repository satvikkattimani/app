import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Satvik restructured a portfolio I had neglected for years. Within one sitting, I finally understood what I owned and why. Clarity is priceless.",
    name: "R. Deshmukh",
    role: "Entrepreneur, Belagavi",
  },
  {
    quote: "What struck me was the patience. No pushing of products — just thoughtful questions about our family's goals before a single fund was discussed.",
    name: "Dr. A. Kulkarni",
    role: "Consultant Physician",
  },
  {
    quote: "My SIPs now run like clockwork and the quarterly reviews keep me honest. It feels less like a service and more like having a private banker.",
    name: "S. Patil",
    role: "Senior Director, IT Services",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" data-testid="testimonials-section" className="py-28 lg:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Testimonials</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-6 leading-tight">
            In their <span className="italic text-[#E6D5B8]">own words.</span>
          </h2>
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
              className="bg-[#121212] border border-white/10 p-10 flex flex-col justify-between hover:border-white/20 transition-colors duration-500"
            >
              <div>
                <Quote size={22} className="text-[#D4AF37]/60" />
                <blockquote className="text-white/70 leading-relaxed mt-6 text-[15px]">"{t.quote}"</blockquote>
              </div>
              <figcaption className="mt-10">
                <p className="font-serif text-lg text-white">{t.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mt-1">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
