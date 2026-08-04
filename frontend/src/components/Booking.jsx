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

  useEffect(() => {
    fetchSlots(date);
  }, [date, fetchSlots]);

  const submit = async (e) => {
    e.preventDefault();
    if (!time) {
      toast.error("Please select a time slot");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/appointments`, {
        ...form,
        type,
        date: format(date, "yyyy-MM-dd"),
        time,
      });
      setConfirmed(data);
      toast.success("Appointment requested successfully");
    } catch (err) {
      toast.error(formatDetail(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" data-testid="booking-section" className="py-28 lg:py-36 bg-[#121212] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Private Appointment</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-6 leading-tight">
            Your first conversation
            <br />
            <span className="italic text-[#E6D5B8]">costs nothing.</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mt-8 max-w-md">
            Reserve an hour with Satvik for a free portfolio consultation or a
            restructuring review. Bring your statements; leave with clarity and a plan.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              "One full hour, one-on-one — in person or over a call",
              "An honest read on your current funds and allocation",
              "A concrete next-step roadmap, yours to keep either way",
            ].map((point, i) => (
              <li key={i} className="flex gap-4 items-start" data-testid={`booking-point-${i}`}>
                <CheckCircle2 size={18} className="text-[#D4AF37] mt-1 shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
          <p className="text-white/40 text-xs mt-12 flex items-center gap-2">
            <Clock size={14} /> Available Monday – Saturday, 10:00 AM – 6:00 PM IST
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="bg-[#0A0A0A] border border-white/10 p-8 sm:p-10"
        >
          {confirmed ? (
            <div className="text-center py-12" data-testid="booking-confirmation">
              <CheckCircle2 size={44} className="text-[#D4AF37] mx-auto" />
              <h3 className="font-serif text-3xl text-white mt-6">Request received.</h3>
              <p className="text-white/60 mt-4 leading-relaxed">
                {confirmed.type_label}
                <br />
                <span className="text-[#E6D5B8]">{confirmed.date} · {confirmed.time} IST</span>
              </p>
              <p className="text-white/40 text-sm mt-6 max-w-sm mx-auto leading-relaxed">
                Satvik will confirm your appointment shortly on {confirmed.phone}.
                For anything urgent, call 9740542188.
              </p>
              <button
                data-testid="booking-another-btn"
                onClick={() => { setConfirmed(null); setForm({ name: "", phone: "", email: "", message: "" }); setTime(null); }}
                className="mt-10 rounded-full border border-white/20 text-white text-sm px-8 py-3 hover:bg-white/5 transition-colors duration-300"
              >
                Book another slot
              </button>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="booking-form">
              <div className="flex gap-3 mb-8">
                {[
                  { v: "consultation", l: "Free Consultation" },
                  { v: "restructuring", l: "Restructuring" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    data-testid={`booking-type-${o.v}`}
                    onClick={() => setType(o.v)}
                    className={`flex-1 rounded-full text-sm py-3 border transition-colors duration-300 ${
                      type === o.v ? "bg-[#D4AF37] text-black border-[#D4AF37] font-medium" : "border-white/20 text-white/60 hover:bg-white/5"
                    }`}
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
                    className="rounded-md border border-white/10 bg-[#121212] text-white"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
                    {format(date, "EEEE, d MMMM")}
                  </p>
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
                          className={`text-xs py-2.5 border rounded-full transition-colors duration-200 ${
                            time === s.time
                              ? "bg-[#D4AF37] text-black border-[#D4AF37] font-medium"
                              : s.available
                              ? "border-white/15 text-white/70 hover:border-[#D4AF37]/60 hover:text-white"
                              : "border-white/5 text-white/20 line-through cursor-not-allowed"
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
                <input
                  data-testid="booking-name-input"
                  className="lux-input"
                  placeholder="Full name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  data-testid="booking-phone-input"
                  className="lux-input"
                  placeholder="Phone *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
                <input
                  data-testid="booking-email-input"
                  type="email"
                  className="lux-input"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  data-testid="booking-message-input"
                  className="lux-input"
                  placeholder="Anything I should know? (optional)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                data-testid="booking-submit-btn"
                disabled={submitting}
                className="mt-10 w-full rounded-full bg-[#D4AF37] text-black font-medium py-4 hover:bg-[#E6D5B8] transition-colors duration-300 disabled:opacity-50"
              >
                {submitting ? "Reserving…" : "Reserve My Hour"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
