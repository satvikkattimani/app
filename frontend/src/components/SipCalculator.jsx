import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Slider } from "@/components/ui/slider";

const inr = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const project = (monthly, years, rate) => {
  const r = rate / 100 / 12;
  const rows = [];
  for (let y = 0; y <= years; y++) {
    const n = y * 12;
    const invested = monthly * n;
    const value = r === 0 ? invested : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    rows.push({ year: y, invested: Math.round(invested), value: Math.round(value) });
  }
  return rows;
};

const Control = ({ label, value, display, min, max, step, onChange, testid }) => (
  <div data-testid={`${testid}-control`}>
    <div className="flex items-baseline justify-between mb-4">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</span>
      <span data-testid={`${testid}-value`} className="font-serif text-2xl text-white">{display}</span>
    </div>
    <Slider data-testid={`${testid}-slider`} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="[&_[role=slider]]:border-copper [&_[role=slider]]:bg-copper [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_.bg-primary]:bg-copper" />
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-abyss border border-copper/30 text-white px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-white/50 uppercase tracking-[0.2em] mb-2">Year {label}</p>
      <p>Invested <span className="text-white/70">{inr(payload[0].value)}</span></p>
      <p>Value <span className="text-copper-glow">{inr(payload[1].value)}</span></p>
    </div>
  );
};

export const SipCalculator = () => {
  const [monthly, setMonthly] = useState(25000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const data = useMemo(() => project(monthly, years, rate), [monthly, years, rate]);
  const last = data[data.length - 1];
  const gain = last.value - last.invested;

  return (
    <section id="sip" data-testid="sip-section" className="py-28 lg:py-40 bg-navy-deep text-white border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper-glow font-medium">03 · SIP Engine</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
            See what patience
            <br />
            <span className="italic text-copper-glow">compounds into.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed mt-6 font-light">
            Move the dials. Watch how a monthly habit becomes a fortune. Then let's make the real one together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mt-16">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:col-span-4 space-y-12">
            <Control label="Monthly SIP" value={monthly} display={inr(monthly)} min={1000} max={500000} step={1000} onChange={setMonthly} testid="sip-amount" />
            <Control label="Duration" value={years} display={`${years} yrs`} min={1} max={30} step={1} onChange={setYears} testid="sip-years" />
            <Control label="Expected return p.a." value={rate} display={`${rate}%`} min={6} max={24} step={0.5} onChange={setRate} testid="sip-rate" />
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 leading-relaxed">
              Illustration only. Returns are not guaranteed; mutual fund investments are subject to market risks.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }} className="lg:col-span-8">
            <div className="grid sm:grid-cols-3 border border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-navy/60">
              {[
                { l: "You invest", v: inr(last.invested), t: "sip-total-invested" },
                { l: "Estimated gain", v: inr(gain), t: "sip-total-gain", accent: true },
                { l: "Projected value", v: inr(last.value), t: "sip-total-value", big: true },
              ].map((s) => (
                <div key={s.l} className="p-6 lg:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{s.l}</p>
                  <p data-testid={s.t} className={`font-serif mt-3 ${s.big ? "text-4xl lg:text-5xl text-white" : "text-3xl text-white/90"} ${s.accent ? "!text-copper-glow" : ""}`}>{s.v}</p>
                </div>
              ))}
            </div>

            <div data-testid="sip-chart" className="h-[320px] sm:h-[380px] mt-8 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DE7E4E" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#DE7E4E" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={inr} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: "#C76A3D", strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="invested" stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} fill="url(#gInv)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="value" stroke="#DE7E4E" strokeWidth={2.5} fill="url(#gValue)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 mt-8">
              <div className="flex gap-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                <span className="flex items-center gap-2"><i className="w-6 h-px bg-white/60 inline-block" /> Invested</span>
                <span className="flex items-center gap-2"><i className="w-6 h-0.5 bg-copper inline-block" /> Projected value</span>
              </div>
              <a href="#booking" data-testid="sip-book-cta" className="bg-copper text-white text-sm font-medium px-7 py-3.5 hover:bg-copper-glow transition-colors duration-300">
                Turn this into a real plan
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
