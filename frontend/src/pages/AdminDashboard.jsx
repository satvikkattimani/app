import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, LogOut, CalendarPlus, Users, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientsPanel } from "@/components/admin/ClientsPanel";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_STYLES = {
  pending: "text-[#E6B85C] border-[#E6B85C]/40",
  confirmed: "text-emerald-400 border-emerald-400/30",
  completed: "text-white/50 border-white/20",
  cancelled: "text-red-400 border-red-400/30",
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [google, setGoogle] = useState({ configured: false, connected: false });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("clients");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const load = useCallback(async () => {
    try {
      const me = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(me.data);
      const [appts, g] = await Promise.all([
        axios.get(`${API}/admin/appointments`, { withCredentials: true }),
        axios.get(`${API}/admin/google/status`, { withCredentials: true }),
      ]);
      setAppointments(appts.data.appointments);
      setGoogle(g.data);
    } catch {
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get("google") === "connected") toast.success("Google Calendar connected");
  }, [searchParams]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/admin/appointments/${id}`, { status }, { withCredentials: true });
      setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
      toast.success(`Marked ${status}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    navigate("/admin/login");
  };

  const connectGoogle = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/google/login`, { withCredentials: true });
      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Google Calendar is not configured yet");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-white/40 text-sm" data-testid="admin-loading">Loading…</p>
      </div>
    );
  }

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
  };

  const tabs = [
    { id: "clients", label: "Clients", icon: Users },
    { id: "appointments", label: "Appointments", icon: ClipboardList },
  ];

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-navy">
      <header className="border-b border-copper/20 bg-navy/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size={34} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper-glow border-l border-white/15 pl-4 hidden sm:inline">Advisor Desk</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              data-testid="google-connect-btn"
              onClick={connectGoogle}
              className="hidden sm:flex items-center gap-2 border border-copper/50 text-copper-glow text-xs px-4 py-2 hover:bg-copper hover:text-white transition-colors duration-300"
            >
              <CalendarPlus size={13} />
              {google.connected ? `Calendar: ${google.email}` : "Connect Google Calendar"}
            </button>
            <Link to="/" data-testid="admin-view-site-link" className="text-white/40 text-xs hover:text-white transition-colors duration-300">View site</Link>
            <button data-testid="admin-logout-btn" onClick={logout} aria-label="Logout" className="text-white/40 hover:text-white transition-colors duration-300">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <p data-testid="admin-welcome" className="text-white/40 text-sm">Signed in as {user?.email}</p>

        <div className="flex gap-2 mt-6 border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-mono uppercase tracking-[0.15em] border-b-2 -mb-px transition-colors duration-300 ${tab === t.id ? "border-copper text-copper-glow" : "border-transparent text-white/45 hover:text-white/80"}`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "appointments" && (
          <div data-testid="appointments-tab">
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
              {[
                { icon: CalendarDays, label: "Total", value: counts.total, testid: "stat-total" },
                { icon: Clock, label: "Pending", value: counts.pending, testid: "stat-pending" },
                { icon: CheckCircle2, label: "Confirmed", value: counts.confirmed, testid: "stat-confirmed" },
              ].map((s) => (
                <div key={s.label} data-testid={s.testid} className="bg-navy-deep/90 border border-copper/25 p-5">
                  <s.icon size={16} className="text-copper-glow" />
                  <p className="font-serif text-3xl text-white mt-3">{s.value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-navy-deep/90 border border-copper/25 overflow-x-auto">
              {appointments.length === 0 ? (
                <p data-testid="appointments-empty" className="text-white/40 text-sm p-10">No appointments yet. New bookings from the website will appear here.</p>
              ) : (
                <table data-testid="appointments-table" className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-white/40 text-xs uppercase tracking-[0.15em]">
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Slot</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} data-testid={`appointment-row-${a.id}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
                        <td className="px-6 py-4 text-white font-medium">{a.name}</td>
                        <td className="px-6 py-4 text-white/60">
                          {a.phone}
                          {a.email && <span className="block text-white/30 text-xs mt-0.5">{a.email}</span>}
                        </td>
                        <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                          {a.date} · {a.time}
                          {a.google_event_id && <span className="block text-copper-glow text-[10px] mt-0.5">On Google Calendar</span>}
                        </td>
                        <td className="px-6 py-4 text-white/60">{a.type_label}</td>
                        <td className="px-6 py-4 text-white/40 max-w-[200px] truncate">{a.message || "—"}</td>
                        <td className="px-6 py-4">
                          <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                            <SelectTrigger data-testid={`status-select-${a.id}`} className={`w-[130px] h-8 text-xs bg-transparent border ${STATUS_STYLES[a.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-navy-deep border-copper/25 text-white">
                              {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                                <SelectItem key={s} value={s} data-testid={`status-option-${s}`} className="text-xs capitalize focus:bg-white/10 focus:text-white">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "clients" && <ClientsPanel />}
      </main>
    </div>
  );
}
