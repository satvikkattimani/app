import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, LogOut, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_STYLES = {
  pending: "text-yellow-400 border-yellow-400/30",
  confirmed: "text-emerald-400 border-emerald-400/30",
  completed: "text-white/50 border-white/20",
  cancelled: "text-red-400 border-red-400/30",
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [google, setGoogle] = useState({ configured: false, connected: false });
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("google") === "connected") {
      toast.success("Google Calendar connected");
    }
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-white/40 text-sm" data-testid="admin-loading">Loading…</p>
      </div>
    );
  }

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
  };

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-lg text-white">Satvik Kattimani</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">Dashboard</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              data-testid="google-connect-btn"
              onClick={connectGoogle}
              className="hidden sm:flex items-center gap-2 rounded-full border border-white/20 text-white/70 text-xs px-4 py-2 hover:bg-white/5 transition-colors duration-300"
            >
              <CalendarPlus size={13} />
              {google.connected ? `Calendar: ${google.email}` : "Connect Google Calendar"}
            </button>
            <Link to="/" data-testid="admin-view-site-link" className="text-white/40 text-xs hover:text-white transition-colors duration-300">
              View site
            </Link>
            <button data-testid="admin-logout-btn" onClick={logout} aria-label="Logout" className="text-white/40 hover:text-white transition-colors duration-300">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <p data-testid="admin-welcome" className="text-white/40 text-sm">Signed in as {user?.email}</p>
        <h1 className="font-serif text-4xl text-white mt-2">Appointments</h1>

        <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
          {[
            { icon: CalendarDays, label: "Total", value: counts.total, testid: "stat-total" },
            { icon: Clock, label: "Pending", value: counts.pending, testid: "stat-pending" },
            { icon: CheckCircle2, label: "Confirmed", value: counts.confirmed, testid: "stat-confirmed" },
          ].map((s) => (
            <div key={s.label} data-testid={s.testid} className="bg-[#121212] border border-white/10 p-5">
              <s.icon size={16} className="text-[#D4AF37]" />
              <p className="font-serif text-3xl text-white mt-3">{s.value}</p>
              <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#121212] border border-white/10 overflow-x-auto">
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
                      {a.google_event_id && <span className="block text-[#D4AF37] text-[10px] mt-0.5">On Google Calendar</span>}
                    </td>
                    <td className="px-6 py-4 text-white/60">{a.type_label}</td>
                    <td className="px-6 py-4 text-white/40 max-w-[200px] truncate">{a.message || "—"}</td>
                    <td className="px-6 py-4">
                      <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                        <SelectTrigger data-testid={`status-select-${a.id}`} className={`w-[130px] h-8 text-xs rounded-full bg-transparent border ${STATUS_STYLES[a.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                          {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                            <SelectItem key={s} value={s} data-testid={`status-option-${s}`} className="text-xs capitalize focus:bg-white/10 focus:text-white">
                              {s}
                            </SelectItem>
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
      </main>
    </div>
  );
}
