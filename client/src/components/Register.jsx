import { useState } from "react";
import axios from "axios";

export default function Register({ onAuthSuccess, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return setError("Please fill all fields");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password,
      });
      if (res.data && res.data.user) {
        onAuthSuccess(res.data.user);
      } else {
        setError("User data not returned from server");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-md w-full bg-slate-800/60 border border-slate-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Create account</h2>
        <p className="text-slate-400 mb-6">Start your mock interview journey</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-slate-900/30 border border-slate-700 text-white"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-lg bg-slate-900/30 border border-slate-700 text-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-3 rounded-lg bg-slate-900/30 border border-slate-700 text-white"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-slate-400 text-sm">
          Already have an account?{" "}
          <button className="text-blue-400 underline" onClick={switchToLogin}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
