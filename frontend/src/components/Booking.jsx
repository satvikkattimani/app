import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format, addDays, isSunday } from "date-fns";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    <section id="booking" data-testid="booking-section" className="py-28 lg:py-40 bg-paper text-ink">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-14 lg:gap-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper font-medium">05 — Private Appointment</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            Your first hour
            <br />
            <span className="italic text-copper">costs nothing.</span>
          </h2>
          <p className="text-ink-2 text-base sm:text-lg leading-relaxed mt-8 max-w-md font-light">
            Reserve an hour with Satvik for a free portfolio consultation or a restructuring review. Bring your statements; leave with clarity and a written plan.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              "One full hour, one-on-one — in person or over a call",
              "An honest, AMC-trained read on your current funds",
              "A concrete next-step roadmap, yours to keep either way",
            ].map((point, i) => (
              <li key={i} className="flex gap-4 items-start" data-testid={`booking-point-${i}`}>
                <CheckCircle2 size={18} className="text-copper mt-1 shrink-0" />
                <span className="text-ink-2 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 mt-12 flex items-center gap-2">
            <Clock size={13} /> Mon – Sat · 10:00 – 18:00 IST · Syncs to Satvik's calendar
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9 }} className="lg:col-span-7 bg-white border border-ink/10 shadow-[0_4px_24px_rgba(11,21,40,0.04)] p-8 sm:p-10 lg:p-12">
          {confirmed ? (
            <div className="text-center py-12" data-testid="booking-confirmation">
              <img src="/brand/logo.png" alt="" className="w-16 h-16 mx-auto" />
              <h3 className="font-serif text-3xl sm:text-4xl mt-6">Your hour is reserved.</h3>
              <p className="text-ink-2 mt-4 leading-relaxed">
                {confirmed.type_label}
                <br />
                <span className="text-copper font-medium">{confirmed.date} · {confirmed.time} IST</span>
              </p>
              <p className="text-ink-3 text-sm mt-6 max-w-sm mx-auto leading-relaxed">
                Satvik will confirm shortly on {confirmed.phone}. For anything urgent, call 9740542188.
              </p>
              <button
                data-testid="booking-another-btn"
                onClick={() => { setConfirmed(null); setForm({ name: "", phone: "", email: "", message: "" }); setTime(null); }}
                className="mt-10 border border-ink text-ink text-sm px-8 py-3 hover:bg-ink hover:text-paper transition-colors duration-300"
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
                    className={`flex-1 text-sm py-3 border transition-colors duration-300 ${type === o.v ? "bg-navy text-white border-navy" : "border-ink/20 text-ink-2 hover:border-ink"}`}
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
                    className="border border-ink/10 bg-paper"
                  />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 mb-4">{format(date, "EEEE, d MMMM")}</p>
                  {slotsLoading ? (
                    <p className="text-ink-3 text-sm" data-testid="slots-loading">Loading slots…</p>
                  ) : slots.length === 0 ? (
                    <p className="text-ink-3 text-sm" data-testid="slots-empty">No slots this day. Sundays are closed.</p>
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
                            time === s.time ? "bg-copper text-white border-copper" : s.available ? "border-ink/15 text-ink-2 hover:border-copper hover:text-copper" : "border-ink/5 text-ink/25 line-through cursor-not-allowed"
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
                <input data-testid="booking-name-input" className="paper-input" placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input data-testid="booking-phone-input" className="paper-input" placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <input data-testid="booking-email-input" type="email" className="paper-input" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input data-testid="booking-message-input" className="paper-input" placeholder="Anything I should know? (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
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
