import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format, addDays, isSunday } from "date-fns";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const calendarClassNames = {
  caption_label: "text-sm font-medium text-white",
  head_cell: "text-white/40 rounded-md w-8 font-normal text-[0.8rem]",
  day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal text-white/80 hover:bg-copper hover:text-white aria-selected:opacity-100"),
  day_selected: "bg-copper text-white hover:bg-copper hover:text-white focus:bg-copper focus:text-white",
  day_today: "border border-copper/50 text-copper-glow",
  day_outside: "day-outside text-white/25",
  day_disabled: "text-white/20 opacity-40",
  nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 text-white/60 border-white/20 hover:opacity-100 hover:text-white"),
};

const formatDetail = (detail) => {
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
};

export const Booking = () => {
  const [date, setDate] = useState(() => {
    let d = new Date();
    if (isSunday(d)) d = addDays(d, 1);
    return d;
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState(null);
  const [type, setType] = useState("consultation");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const fetchSlots = useCallback(async (d) => {
    setSlotsLoading(true);
    setTime(null);
    try {
      const { data } = await axios.get(`${API}/slots`, { params: { date: format(d, "yyyy-MM-dd") } });
      setSlots(data.slots);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlots(date); }, [date, fetchSlots]);

  const submit = async (e) => {
    e.preventDefault();
    if (!time) { toast.error("Please select a time slot"); return; }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/appointments`, { ...form, type, date: format(date, "yyyy-MM-dd"), time });
      setConfirmed(data);
      toast.success("Appointment requested successfully");
    } catch (err) {
      toast.error(formatDetail(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" data-testid="booking-section" className="py-28 lg:py-40 bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-14 lg:gap-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper-glow font-medium">05 · Private Appointment</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            Your first hour
            <br />
            <span className="italic text-copper-glow">costs nothing.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed mt-8 max-w-md font-light">
            Reserve an hour with your advisor for a free portfolio consultation or a restructuring review. Bring your statements; leave with clarity and a written plan.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              "One full hour, one-on-one, in person or over a call",
              "An honest, AMC-trained read on your current funds",
              "A concrete next-step roadmap, yours to keep either way",
            ].map((point, i) => (
              <li key={i} className="flex gap-4 items-start" data-testid={`booking-point-${i}`}>
                <CheckCircle2 size={18} className="text-copper-glow mt-1 shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-12 flex items-center gap-2">
            <Clock size={13} /> Mon to Sat · 10:00 to 18:00 IST · Your direct line is shared once a slot is confirmed
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9 }} className="lg:col-span-7 bg-navy-surface/60 border border-white/10 shadow-[0_20px_60px_rgba(7,13,24,0.4)] p-8 sm:p-10 lg:p-12">
          {confirmed ? (
            <div className="text-center py-12" data-testid="booking-confirmation">
              <img src="/brand/logo.png" alt="" className="w-16 h-16 mx-auto" />
              <h3 className="font-serif text-3xl sm:text-4xl mt-6">Your hour is reserved.</h3>
              <p className="text-white/60 mt-4 leading-relaxed">
                {confirmed.type_label}
                <br />
                <span className="text-copper-glow font-medium">{confirmed.date} · {confirmed.time} IST</span>
              </p>
              <p className="text-white/50 text-sm mt-6 max-w-sm mx-auto leading-relaxed">
                Your advisor will confirm shortly on {confirmed.phone}. Your direct line for this appointment: <span className="text-copper-glow">9740542188</span>.
              </p>
              <button
                data-testid="booking-another-btn"
                onClick={() => { setConfirmed(null); setForm({ name: "", phone: "", email: "", message: "" }); setTime(null); }}
                className="mt-10 border border-white/30 text-white text-sm px-8 py-3 hover:bg-white hover:text-navy transition-colors duration-300"
              >
                Book another slot
              </button>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="booking-form">
              <div className="flex gap-3 mb-8">
                {[{ v: "consultation", l: "Free Consultation" }, { v: "restructuring", l: "Portfolio Restructuring" }].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    data-testid={`booking-type-${o.v}`}
                    onClick={() => setType(o.v)}
                    className={`flex-1 text-sm py-3 border transition-colors duration-300 ${type === o.v ? "bg-copper text-white border-copper" : "border-white/20 text-white/60 hover:border-white/50"}`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div data-testid="booking-calendar" className="[&_.rdp]:m-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    disabled={[{ before: new Date() }, { after: addDays(new Date(), 30) }, { dayOfWeek: [0] }]}
                    classNames={calendarClassNames}
                    className="border border-white/10 bg-navy/50 text-white"
                  />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">{format(date, "EEEE, d MMMM")}</p>
                  {slotsLoading ? (
                    <p className="text-white/40 text-sm" data-testid="slots-loading">Loading slots…</p>
                  ) : slots.length === 0 ? (
                    <p className="text-white/40 text-sm" data-testid="slots-empty">No slots this day. Sundays are closed.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2" data-testid="slots-grid">
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          type="button"
                          data-testid={`slot-${s.time}`}
                          disabled={!s.available}
                          onClick={() => setTime(s.time)}
                          className={`font-mono text-xs py-2.5 border transition-colors duration-200 ${
                            time === s.time ? "bg-copper text-white border-copper" : s.available ? "border-white/15 text-white/70 hover:border-copper hover:text-copper-glow" : "border-white/5 text-white/20 line-through cursor-not-allowed"
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mt-10">
                <input data-testid="booking-name-input" className="navy-input" placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input data-testid="booking-phone-input" className="navy-input" placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <input data-testid="booking-email-input" type="email" className="navy-input" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input data-testid="booking-message-input" className="navy-input" placeholder="Anything I should know? (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button type="submit" data-testid="booking-submit-btn" disabled={submitting} className="mt-10 w-full bg-copper text-white font-medium py-4 hover:bg-copper-glow transition-colors duration-300 disabled:opacity-50 shadow-[0_4px_20px_rgba(199,106,61,0.28)]">
                {submitting ? "Reserving…" : "Reserve My Hour"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
