import { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { X, Check } from "lucide-react";

const MONTHLY = 25000;
const YEARS = 20;
const DIRECT_REALISED = 9.75;
const REGULAR_REALISED = 11.5;

const fv = (rate, months) => {
  const r = rate / 100 / 12;
  return MONTHLY * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
};
const cr = (n) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : `₹${(n / 1e5).toFixed(0)} L`);

const rows = [
  { k: "Expense ratio", d: "Lower by roughly 0.5–1% a year", r: "Includes your advisor's ongoing fee", win: "d" },
  { k: "Fund selection", d: "You, from 1,500+ schemes and star ratings", r: "AMC-trained due diligence on mandate and manager", win: "r" },
  { k: "Rebalancing", d: "When you remember", r: "Scheduled, quarterly, documented", win: "r" },
  { k: "A 30% market fall", d: "You, alone, at 2 a.m., with a redeem button", r: "Satvik on the phone before you press anything", win: "r" },
  { k: "KYC, nominations, taxation", d: "Your evenings", r: "Handled, with harvesting done on time", win: "r" },
  { k: "Investor behaviour gap*", d: "Industry studies put it at −3% to −4% p.a.", r: "Narrowed substantially by a human anchor", win: "r" },
  { k: "Accountability", d: "Nobody", r: "One name. One number.", win: "r" },
];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-paper text-ink px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-ink-3 uppercase tracking-[0.2em] mb-2">Year {label}</p>
      <p>Direct, DIY <span className="text-ink-2">{cr(payload[0].value)}</span></p>
      <p>Regular, guided <span className="text-copper">{cr(payload[1].value)}</span></p>
    </div>
  );
};

export const DirectVsRegular = () => {
  const data = useMemo(() => Array.from({ length: YEARS + 1 }, (_, y) => ({ year: y, direct: Math.round(fv(DIRECT_REALISED, y * 12)), regular: Math.round(fv(REGULAR_REALISED, y * 12)) })), []);
  const end = data[YEARS];
  const delta = end.regular - end.direct;

  return (
    <section id="plans" data-testid="plans-section" className="relative py-28 lg:py-40 bg-navy text-white overflow-hidden">
      <div className="absolute inset-0 nav-grid opacity-70" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper-glow font-medium">04 — The Honest Comparison</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-6">
              Direct plan
              <span className="text-white/40 font-light"> vs </span>
              <span className="italic text-copper-glow">guided regular plan.</span>
            </h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-white/60 text-base leading-relaxed font-light self-end">
            The direct plan saves you a fraction of a percent. What it costs you is everything the fraction was paying for — and over twenty years, that gap compounds too.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:col-span-7">
            <div data-testid="plans-matrix" className="border border-white/10 bg-navy-deep/80 backdrop-blur-xl">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                <div className="p-4 sm:p-5" />
                <div className="p-4 sm:p-5 border-l border-white/10">Direct · DIY</div>
                <div className="p-4 sm:p-5 border-l border-copper/40 text-copper-glow bg-copper/5">Regular · with Satvik</div>
              </div>
              {rows.map((r, i) => (
                <div key={r.k} data-testid={`plans-row-${i}`} className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-white/5 last:border-b-0 text-[13px] sm:text-sm">
                  <div className="p-4 sm:p-5 font-serif text-base sm:text-lg text-white/90">{r.k}</div>
                  <div className="p-4 sm:p-5 border-l border-white/10 text-white/55 font-light flex gap-2">
                    {r.win === "d" ? <Check size={14} className="text-emerald-400 mt-1 shrink-0" /> : <X size={14} className="text-white/25 mt-1 shrink-0" />}
                    {r.d}
                  </div>
                  <div className="p-4 sm:p-5 border-l border-copper/30 bg-copper/5 text-white/85 font-light flex gap-2">
                    {r.win === "r" ? <Check size={14} className="text-copper-glow mt-1 shrink-0" /> : <X size={14} className="text-white/25 mt-1 shrink-0" />}
                    {r.r}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }} className="lg:col-span-5">
            <div className="border border-copper/30 p-8 lg:p-10 bg-navy-deep/60 backdrop-blur-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Illustration · ₹25,000 SIP · 20 years</p>
              <p data-testid="plans-delta" className="font-serif text-5xl lg:text-6xl text-copper-glow mt-4 leading-none">{cr(delta)}</p>
              <p className="text-white/60 text-sm mt-3 font-light">more wealth with the guided regular plan — after paying the advisor.</p>

              <div data-testid="plans-chart" className="h-[240px] mt-8 -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={cr} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={74} />
                    <Tooltip content={<Tip />} cursor={{ stroke: "#C76A3D", strokeDasharray: "3 3" }} />
                    <Line type="monotone" dataKey="direct" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                    <Line type="monotone" dataKey="regular" stroke="#DE7E4E" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <dl className="grid grid-cols-2 gap-6 mt-8 border-t border-white/10 pt-6">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Direct, DIY</dt>
                  <dd data-testid="plans-direct-value" className="font-serif text-2xl text-white/70 mt-2">{cr(end.direct)}</dd>
                  <dd className="text-white/40 text-xs mt-1">{DIRECT_REALISED}% realised p.a.</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper-glow">Regular, guided</dt>
                  <dd data-testid="plans-regular-value" className="font-serif text-2xl text-white mt-2">{cr(end.regular)}</dd>
                  <dd className="text-white/40 text-xs mt-1">{REGULAR_REALISED}% realised p.a.</dd>
                </div>
              </dl>
            </div>
            <p className="text-white/35 text-[11px] leading-relaxed mt-6 font-light">
              *Assumes a 12% underlying fund return. Direct plan: +0.75% lower expenses, −3% investor behaviour gap (mistimed entries and exits, missed rebalancing) as observed in Indian and global investor-return studies. Regular plan: net of advisory cost, −0.5% residual gap. Illustrative only; actual outcomes vary and returns are not guaranteed.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
