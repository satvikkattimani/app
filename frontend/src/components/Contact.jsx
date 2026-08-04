import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Clock } from "lucide-react";

const channels = [
  {
    icon: Phone,
    title: "Call directly",
    value: "+91 97405 42188",
    href: "tel:+919740542188",
    testid: "contact-phone",
    note: "Mon – Sat, 10 AM – 7 PM",
  },
  {
    icon: Mail,
    title: "Write to me",
    value: "satvikkinvestments@gmail.com",
    href: "mailto:satvikkinvestments@gmail.com",
    testid: "contact-email",
    note: "Replies within 24 hours",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Message on WhatsApp",
    href: "https://wa.me/919740542188",
    testid: "contact-whatsapp",
    note: "Quickest for existing clients",
  },
];

export const Contact = () => {
  return (
    <section id="contact" data-testid="contact-section" className="py-28 lg:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Service Desk</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-6 leading-tight">
            One person answers.
            <br />
            <span className="italic text-[#E6D5B8]">Every time.</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mt-8">
            No ticket numbers, no queues. Whether you're exploring your first SIP or
            reviewing a crore-plus portfolio, you reach Satvik directly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {channels.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              data-testid={c.testid}
              className="group bg-[#121212] border border-white/10 p-10 hover:border-[#D4AF37]/40 hover:-translate-y-1 transition-[border-color,transform] duration-500"
            >
              <c.icon size={24} className="text-[#D4AF37]" />
              <h3 className="text-white/50 text-xs uppercase tracking-[0.2em] mt-6">{c.title}</h3>
              <p className="font-serif text-xl text-white mt-3 group-hover:text-[#E6D5B8] transition-colors duration-300 break-all">
                {c.value}
              </p>
              <p className="text-white/40 text-xs mt-4 flex items-center gap-2">
                <Clock size={12} /> {c.note}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
