import { motion } from "framer-motion";
import { Mail, CalendarClock, MessageCircle } from "lucide-react";

const channels = [
  { icon: Mail, title: "Write to your advisor", value: "satvikkinvestments@gmail.com", href: "mailto:satvikkinvestments@gmail.com", testid: "contact-email", note: "A personal reply within 24 hours", external: false },
  { icon: CalendarClock, title: "Reserve an hour", value: "Book a free consultation", href: "#booking", testid: "contact-book", note: "Your direct line is shared once a slot is confirmed", external: false },
  { icon: MessageCircle, title: "The concierge", value: "Ask a quick question", href: "#top", testid: "contact-concierge", note: "Use the chat, bottom-right, any time", external: false },
];

export const Contact = () => (
  <section id="contact" data-testid="contact-section" className="py-28 lg:py-40 bg-navy-abyss text-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper-glow font-medium">06 · Direct Desk</p>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
          No tickets. No queues.
          <br />
          <span className="italic text-copper-glow">One person answers.</span>
        </h2>
        <p className="text-white/60 text-base sm:text-lg leading-relaxed mt-8 font-light">
          Whether you're exploring your first SIP or reviewing a crore-plus portfolio, you reach your advisor directly. Book an hour and the private line follows once your slot is confirmed.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-px bg-white/10 mt-16 border border-white/10">
        {channels.map((c, i) => (
          <motion.a
            key={c.title}
            href={c.href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            data-testid={c.testid}
            className="group bg-navy-abyss p-10 lg:p-12 hover:bg-copper transition-colors duration-500"
          >
            <c.icon size={24} className="text-copper-glow group-hover:text-white transition-colors duration-500" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 group-hover:text-white/70 mt-8 transition-colors duration-500">{c.title}</h3>
            <p className="font-serif text-2xl lg:text-3xl mt-3 break-words">{c.value}</p>
            <p className="text-white/40 group-hover:text-white/80 text-xs mt-5 transition-colors duration-500">{c.note}</p>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);
