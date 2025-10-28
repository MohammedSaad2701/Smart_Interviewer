import logo from "../assets/logo.png";
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
      const res = await fetch('https://smart-interviewer-8.onrender.com/api/auth/login', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* 🌐 Navbar */}
      <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Smart Interviewer Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wide">Smart Interviewer</h1>
        </div>
        <div className="hidden md:flex space-x-6 text-gray-300">
          <a href="/" className="hover:text-white">Home</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="#contact" className="hover:text-white">Contact</a>
        </div>
      </nav>

      {/* 🧠 Login Form */}
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Welcome back</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-6 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-gray-400 text-sm text-center">
            Don’t have an account?{" "}
            <span
              onClick={switchToRegister}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
