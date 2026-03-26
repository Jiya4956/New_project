import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const userData = await register(form.name, form.email, form.password, form.role);
      navigate(userData?.role === 'admin' ? '/admin' : '/scholarships');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'][strength];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join 10,000+ students finding scholarships</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name" name="name" type="text"
                value={form.name} onChange={handleChange}
                required className="input" placeholder="John Doe"
              />
            </div>
            <div>
              <label className="label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email" name="email" type="email"
                value={form.email} onChange={handleChange}
                required className="input" placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password" name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  required className="input pr-12" placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  {strengthLabel && <p className={`text-xs font-medium ${['','text-red-500','text-orange-500','text-amber-500','text-blue-500','text-emerald-500'][strength]}`}>{strengthLabel}</p>}
                </div>
              )}
            </div>
            <div>
              <label className="label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm" name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                value={form.confirmPassword} onChange={handleChange}
                required className={`input ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                placeholder="Repeat password"
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student', icon: '🎓', label: 'Student', desc: 'Find & apply for scholarships' },
                  { value: 'admin',   icon: '🛡️', label: 'Admin',   desc: 'Manage scholarship listings' },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      form.role === r.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{r.label}</div>
                    <div className="text-xs text-slate-400">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-bold"
              id="register-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : '🚀 Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs text-slate-400 font-medium uppercase">or sign up with</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Google OAuth */}
          <a
            href="http://localhost:5000/api/auth/google"
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md"
            id="google-register"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </a>
        </div>

        <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline dark:text-blue-400">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
