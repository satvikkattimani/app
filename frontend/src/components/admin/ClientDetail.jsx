import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowLeft, Plus, Trash2, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { inr } from "@/components/admin/ClientsPanel";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const COLORS = ["#C76A3D", "#DE7E4E", "#5B8DB8", "#8AB0D0", "#E6D5B8", "#6E7E91"];
const CATEGORIES = ["Equity", "Debt", "Hybrid", "Liquid", "ELSS", "Other"];

const pct = (n) => (n === null || n === undefined ? "—" : `${n > 0 ? "+" : ""}${n}%`);
const gainColor = (n) => (n > 0 ? "text-emerald-400" : n < 0 ? "text-red-400" : "text-white/70");
const emptyHolding = { scheme_code: "", scheme_name: "", units: "", invested_amount: "", invested_date: "", category: "Equity", folio: "" };

const AllocTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-navy-abyss border border-copper/30 px-3 py-2 text-xs font-mono text-white">
      {p.name}: <span className="text-copper-glow">{inr(p.value)}</span>
    </div>
  );
};

export const ClientDetail = ({ clientId, onBack }) => {
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [holding, setHolding] = useState(emptyHolding);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [openList, setOpenList] = useState(false);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/admin/clients/${clientId}`, { withCredentials: true });
      setData(data);
    } catch {
      toast.error("Could not load client");
    }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 3) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get(`${API}/admin/funds/search`, { params: { q: query }, withCredentials: true });
        setResults(data.results);
        setOpenList(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => timer.current && clearTimeout(timer.current);
  }, [query]);

  const pickFund = (f) => {
    setHolding((h) => ({ ...h, scheme_code: f.code, scheme_name: f.name }));
    setQuery(f.name);
    setOpenList(false);
  };

  const addHolding = async (e) => {
    e.preventDefault();
    if (!holding.scheme_code) { toast.error("Search and pick a fund first"); return; }
    if (!holding.units || !holding.invested_amount) { toast.error("Enter units and invested amount"); return; }
    try {
      await axios.post(`${API}/admin/clients/${clientId}/holdings`, {
        ...holding,
        units: parseFloat(holding.units),
        invested_amount: parseFloat(holding.invested_amount),
      }, { withCredentials: true });
      toast.success("Holding added");
      setHolding(emptyHolding); setQuery(""); setResults([]); setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not add holding");
    }
  };

  const removeHolding = async (id) => {
    try {
      await axios.delete(`${API}/admin/holdings/${id}`, { withCredentials: true });
      toast.success("Holding removed");
      load();
    } catch {
      toast.error("Could not remove holding");
    }
  };

  const removeClient = async () => {
    if (!window.confirm("Delete this client and all their holdings?")) return;
    try {
      await axios.delete(`${API}/admin/clients/${clientId}`, { withCredentials: true });
      toast.success("Client deleted");
      onBack();
    } catch {
      toast.error("Could not delete client");
    }
  };

  if (!data) {
    return <p className="text-white/40 text-sm mt-10" data-testid="client-detail-loading">Loading…</p>;
  }

  const { client, summary, holdings } = data;
  const cards = [
    { l: "Invested", v: inr(summary.invested) },
    { l: "Current value", v: inr(summary.current_value), big: true },
    { l: "Gain", v: inr(summary.gain), color: gainColor(summary.gain) },
    { l: "Return", v: pct(summary.return_pct), color: gainColor(summary.return_pct) },
    { l: "XIRR", v: pct(summary.xirr), color: gainColor(summary.xirr) },
  ];

  return (
    <div data-testid="client-detail">
      <button data-testid="client-back-btn" onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm hover:text-white mt-8 transition-colors">
        <ArrowLeft size={15} /> All clients
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mt-6">
        <div>
          <h1 className="font-serif text-4xl text-white" data-testid="client-name">{client.name}</h1>
          <p className="text-white/40 text-sm mt-2 font-mono">
            {[client.phone, client.email, client.pan].filter(Boolean).join("  ·  ") || "No contact details"}
          </p>
          {client.notes && <p className="text-white/50 text-sm mt-2 max-w-xl">{client.notes}</p>}
        </div>
        <button data-testid="delete-client-btn" onClick={removeClient} className="flex items-center gap-2 border border-red-400/40 text-red-400/80 text-xs px-4 py-2.5 hover:bg-red-400/10 transition-colors">
          <Trash2 size={13} /> Delete client
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.l} data-testid={`summary-${c.l.toLowerCase().replace(/\s+/g, "-")}`} className="bg-navy-deep/90 border border-copper/25 p-5">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">{c.l}</p>
            <p className={`font-serif mt-2 ${c.big ? "text-3xl text-white" : "text-2xl"} ${c.color || "text-white/90"}`}>{c.v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mt-10">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-white">Holdings</h2>
            <button data-testid="add-holding-btn" onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2 bg-copper text-white text-xs px-4 py-2.5 hover:bg-copper-glow transition-colors">
              <Plus size={13} /> Add holding
            </button>
          </div>

          {showForm && (
            <form data-testid="add-holding-form" onSubmit={addHolding} className="mt-6 bg-navy-deep/90 border border-copper/25 p-6 space-y-5">
              <div className="relative">
                <div className="flex items-center gap-2 navy-input">
                  <Search size={14} className="text-white/40 shrink-0" />
                  <input
                    data-testid="fund-search-input"
                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-white/30"
                    placeholder="Search mutual fund scheme (min 3 letters)…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setHolding((h) => ({ ...h, scheme_code: "" })); }}
                    onFocus={() => results.length && setOpenList(true)}
                  />
                  {searching && <span className="text-white/40 text-xs">…</span>}
                </div>
                {openList && results.length > 0 && (
                  <div data-testid="fund-search-results" className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-navy-abyss border border-copper/30 shadow-xl">
                    {results.map((f) => (
                      <button
                        type="button"
                        key={f.code}
                        data-testid={`fund-option-${f.code}`}
                        onClick={() => pickFund(f)}
                        className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-copper/20 border-b border-white/5 last:border-b-0"
                      >
                        <span className="block">{f.name}</span>
                        <span className="block text-white/40 text-xs mt-0.5 font-mono">NAV ₹{f.nav} · {f.date}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <input data-testid="holding-units-input" type="number" step="any" className="navy-input" placeholder="Units held *" value={holding.units} onChange={(e) => setHolding({ ...holding, units: e.target.value })} />
                <input data-testid="holding-invested-input" type="number" step="any" className="navy-input" placeholder="Amount invested (₹) *" value={holding.invested_amount} onChange={(e) => setHolding({ ...holding, invested_amount: e.target.value })} />
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Invested since (for XIRR)</label>
                  <input data-testid="holding-date-input" type="date" className="navy-input mt-1" value={holding.invested_date} onChange={(e) => setHolding({ ...holding, invested_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Category</label>
                  <select data-testid="holding-category-select" className="navy-input mt-1 [&>option]:bg-navy-abyss" value={holding.category} onChange={(e) => setHolding({ ...holding, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input data-testid="holding-folio-input" className="navy-input" placeholder="Folio number (optional)" value={holding.folio} onChange={(e) => setHolding({ ...holding, folio: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" data-testid="holding-save-btn" className="bg-copper text-white text-sm px-6 py-2.5 hover:bg-copper-glow transition-colors">Save holding</button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-white/20 text-white/60 text-sm px-6 py-2.5 hover:text-white">Cancel</button>
              </div>
            </form>
          )}

          <div className="mt-6 bg-navy-deep/90 border border-copper/25 overflow-x-auto">
            {holdings.length === 0 ? (
              <p data-testid="holdings-empty" className="text-white/40 text-sm p-8">No holdings logged yet.</p>
            ) : (
              <table data-testid="holdings-table" className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/40 text-xs uppercase tracking-[0.15em]">
                    <th className="px-5 py-3">Scheme</th>
                    <th className="px-5 py-3">Units</th>
                    <th className="px-5 py-3">NAV</th>
                    <th className="px-5 py-3">Invested</th>
                    <th className="px-5 py-3">Current</th>
                    <th className="px-5 py-3">Return</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.id} data-testid={`holding-row-${h.id}`} className="border-b border-white/5">
                      <td className="px-5 py-4">
                        <span className="text-white/90">{h.scheme_name}</span>
                        <span className="block text-white/30 text-xs mt-0.5">{h.category}{h.folio ? ` · Folio ${h.folio}` : ""}</span>
                      </td>
                      <td className="px-5 py-4 text-white/60">{h.units}</td>
                      <td className="px-5 py-4 text-white/60">{h.nav ? `₹${h.nav}` : "—"}<span className="block text-white/25 text-[10px]">{h.nav_date || ""}</span></td>
                      <td className="px-5 py-4 text-white/70">{inr(h.invested_amount)}</td>
                      <td className="px-5 py-4 text-white font-medium">{inr(h.current_value)}</td>
                      <td className={`px-5 py-4 ${gainColor(h.return_pct)}`}>{pct(h.return_pct)}</td>
                      <td className="px-5 py-4 text-right">
                        <button data-testid={`delete-holding-${h.id}`} onClick={() => removeHolding(h.id)} className="text-white/30 hover:text-red-400 transition-colors" aria-label="Delete holding"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="font-serif text-2xl text-white">Asset allocation</h2>
          <div className="mt-6 bg-navy-deep/90 border border-copper/25 p-6">
            {summary.allocation && summary.allocation.length > 0 ? (
              <div data-testid="allocation-chart" className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary.allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} stroke="none">
                      {summary.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<AllocTip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "IBM Plex Mono" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-white/40 text-sm gap-3">
                <Wallet size={28} className="text-white/20" />
                Add holdings to see allocation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
