import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const formatDetail = (detail) => {
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      navigate("/admin");
    } catch (err) {
      setError(formatDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 p-10">
        <ShieldCheck size={26} className="text-[#D4AF37]" />
        <h1 className="font-serif text-3xl text-white mt-6">Advisor Login</h1>
        <p className="text-white/40 text-sm mt-2">Satvik Kattimani · ARN-349743</p>

        <form onSubmit={submit} data-testid="admin-login-form" className="mt-10 space-y-8">
          <input
            data-testid="admin-email-input"
            type="email"
            className="lux-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            data-testid="admin-password-input"
            type="password"
            className="lux-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p data-testid="admin-login-error" className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            data-testid="admin-login-submit-btn"
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] text-black font-medium py-3.5 hover:bg-[#E6D5B8] transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <Link to="/" data-testid="admin-back-home-link" className="block text-center text-white/30 text-xs mt-8 hover:text-white/60 transition-colors duration-300">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
