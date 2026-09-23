import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Wallet, TrendingUp, RefreshCw, Plus, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { ClientDetail } from "@/components/admin/ClientDetail";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const inr = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const pct = (n) => (n === null || n === undefined ? "—" : `${n > 0 ? "+" : ""}${n}%`);
const gainColor = (n) => (n > 0 ? "text-emerald-400" : n < 0 ? "text-red-400" : "text-white/70");

export const ClientsPanel = () => {
  const [clients, setClients] = useState([]);
  const [navUpdated, setNavUpdated] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", pan: "", notes: "" });

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/admin/clients`, { withCredentials: true });
      setClients(data.clients);
      setNavUpdated(data.nav_updated);
    } catch {
      toast.error("Could not load clients");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createClient = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try {
      await axios.post(`${API}/admin/clients`, form, { withCredentials: true });
      toast.success("Client added");
      setForm({ name: "", email: "", phone: "", pan: "", notes: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not add client");
    }
  };

  const refreshNav = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API}/admin/nav/refresh`, {}, { withCredentials: true });
      toast.success("Live NAV refreshed");
      load();
    } catch {
      toast.error("Could not refresh NAV");
    } finally {
      setRefreshing(false);
    }
  };

  if (selected) {
    return <ClientDetail clientId={selected} onBack={() => { setSelected(null); load(); }} />;
  }

  const totals = clients.reduce(
    (acc, c) => ({ invested: acc.invested + (c.invested || 0), current: acc.current + (c.current_value || 0), gain: acc.gain + (c.gain || 0) }),
    { invested: 0, current: 0, gain: 0 }
  );
  const totalRet = totals.invested > 0 ? Math.round((totals.gain / totals.invested) * 1000) / 10 : null;

  const stats = [
    { icon: Users, label: "Clients", value: clients.length, testid: "stat-clients" },
    { icon: Wallet, label: "Assets under advice", value: inr(totals.current), testid: "stat-aum" },
    { icon: TrendingUp, label: "Total invested", value: inr(totals.invested), testid: "stat-invested" },
    { icon: TrendingUp, label: "Overall gain", value: `${inr(totals.gain)} (${pct(totalRet)})`, testid: "stat-gain", color: gainColor(totals.gain) },
  ];

  return (
    <div data-testid="clients-panel">
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
        <div>
          <h1 className="font-serif text-3xl text-white">Client Portfolios</h1>
          <p className="text-white/40 text-xs mt-1 font-mono">
            Live valuation from AMFI daily NAV{navUpdated ? ` · updated ${new Date(navUpdated).toLocaleString("en-IN")}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button data-testid="refresh-nav-btn" onClick={refreshNav} disabled={refreshing} className="flex items-center gap-2 border border-white/20 text-white/70 text-xs px-4 py-2.5 hover:border-copper hover:text-copper-glow transition-colors duration-300 disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh NAV
          </button>
          <button data-testid="add-client-btn" onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2 bg-copper text-white text-xs px-4 py-2.5 hover:bg-copper-glow transition-colors duration-300">
            <Plus size={13} /> Add Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map((s) => (
          <div key={s.label} data-testid={s.testid} className="bg-navy-deep/90 border border-copper/25 p-5">
            <s.icon size={16} className="text-copper-glow" />
            <p className={`font-serif text-2xl mt-3 ${s.color || "text-white"}`}>{s.value}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form data-testid="add-client-form" onSubmit={createClient} className="mt-8 bg-navy-deep/90 border border-copper/25 p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <input data-testid="client-name-input" className="navy-input" placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input data-testid="client-email-input" className="navy-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input data-testid="client-phone-input" className="navy-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input data-testid="client-pan-input" className="navy-input uppercase" placeholder="PAN" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
          <input data-testid="client-notes-input" className="navy-input sm:col-span-2 lg:col-span-1" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
            <button type="submit" data-testid="client-save-btn" className="bg-copper text-white text-sm px-6 py-2.5 hover:bg-copper-glow transition-colors">Save client</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-white/20 text-white/60 text-sm px-6 py-2.5 hover:text-white">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 bg-navy-deep/90 border border-copper/25 overflow-x-auto">
        {clients.length === 0 ? (
          <p data-testid="clients-empty" className="text-white/40 text-sm p-10">No clients yet. Add a client, then log their mutual fund holdings to see live valuation, returns and XIRR.</p>
        ) : (
          <table data-testid="clients-table" className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/40 text-xs uppercase tracking-[0.15em]">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Holdings</th>
                <th className="px-6 py-4">Invested</th>
                <th className="px-6 py-4">Current value</th>
                <th className="px-6 py-4">Gain</th>
                <th className="px-6 py-4">Return</th>
                <th className="px-6 py-4">XIRR</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} data-testid={`client-row-${c.id}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer" onClick={() => setSelected(c.id)}>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{c.name}</span>
                    {c.phone && <span className="block text-white/30 text-xs mt-0.5">{c.phone}</span>}
                  </td>
                  <td className="px-6 py-4 text-white/60">{c.holdings_count}</td>
                  <td className="px-6 py-4 text-white/70">{inr(c.invested)}</td>
                  <td className="px-6 py-4 text-white font-medium">{inr(c.current_value)}</td>
                  <td className={`px-6 py-4 font-medium ${gainColor(c.gain)}`}>{inr(c.gain)}</td>
                  <td className={`px-6 py-4 ${gainColor(c.return_pct)}`}>{pct(c.return_pct)}</td>
                  <td className={`px-6 py-4 ${gainColor(c.xirr)}`}>{pct(c.xirr)}</td>
                  <td className="px-6 py-4 text-right">
                    <button data-testid={`view-client-${c.id}`} className="text-copper-glow hover:text-copper inline-flex" aria-label="Open client"><ArrowUpRight size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
