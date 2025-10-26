import { useState } from 'react';

export default function Login({ onAuthSuccess, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please provide email and password');
    setLoading(true);
    try {
      const res = await fetch('https://smart-interviewer-8.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Login failed');

      // ✅ Save token + user info for persistence
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Notify parent that login succeeded
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-md w-full bg-slate-800/60 border border-slate-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome back</h2>
        <p className="text-slate-400 mb-6">Sign in to continue to Smart Interviewer</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-4 text-slate-400 text-sm">
          Don’t have an account?{' '}
          <button className="text-blue-400 underline" onClick={switchToRegister}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
