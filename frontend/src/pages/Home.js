import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const STATS = [
  { value: '500+', label: 'Active Scholarships', icon: '🎓', color: 'from-blue-500 to-blue-600' },
  { value: '10K+', label: 'Students Registered',  icon: '👨‍🎓', color: 'from-purple-500 to-purple-600' },
  { value: '50+',  label: 'Countries Covered',    icon: '🌍', color: 'from-emerald-500 to-emerald-600' },
  { value: '95%',  label: 'Success Rate',          icon: '🏆', color: 'from-amber-500 to-amber-600' },
];

const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart Discovery',
    desc: 'AI-powered recommendations tailored to your academic profile, income, and goals.',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    icon: '⚡',
    title: 'One-Click Apply',
    desc: 'Streamlined application forms with document management and real-time status tracking.',
    color: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
  },
  {
    icon: '📊',
    title: 'Live Dashboard',
    desc: 'Monitor all your applications in one place with live updates and deadline reminders.',
    color: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    icon: '💬',
    title: 'AI Chatbot',
    desc: 'Ask any scholarship question and get instant, accurate answers from our AI assistant.',
    color: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    icon: '🌐',
    title: 'Currency Conversion',
    desc: 'View scholarship amounts in your local currency for better understanding of value.',
    color: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
  },
  {
    icon: '🏛️',
    title: 'Discussion Forum',
    desc: 'Connect with fellow students, share tips, and get advice from scholarship winners.',
    color: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
];

const CATEGORIES = [
  { label: 'Merit-Based', icon: '🏅', count: '120+', color: 'bg-blue-600' },
  { label: 'Need-Based', icon: '🤝', count: '95+', color: 'bg-purple-600' },
  { label: 'Government', icon: '🏛️', count: '80+', color: 'bg-emerald-600' },
  { label: 'International', icon: '🌍', count: '150+', color: 'bg-amber-600' },
  { label: 'Academic', icon: '📚', count: '60+', color: 'bg-rose-600' },
  { label: 'Private', icon: '🏢', count: '45+', color: 'bg-cyan-600' },
];

const Home = () => {
  const { user } = useAuth();
  const [recentScholarships, setRecentScholarships] = useState([]);
  const [loadingScholarships, setLoadingScholarships] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/api/scholarships?limit=6&sort=-createdAt')
      .then(res => setRecentScholarships(res.data.scholarships || []))
      .catch(() => {})
      .finally(() => setLoadingScholarships(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/scholarships?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="dark:bg-slate-900">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background  decorations */}
        <div className="absolute inset-0 hero-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium border border-white/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              500+ Scholarships Available Right Now
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-fadeInUp text-balance">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Scholarship Match
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              AI-powered scholarship discovery for students worldwide. Filter by country, course, income, and more. Your academic dream is one click away.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scholarships, providers, countries..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  id="hero-search"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                id="hero-search-btn"
              >
                Search
              </button>
            </form>

            {/* CTA Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                  id="hero-get-started"
                >
                  🚀 Get Started Free
                </Link>
                <Link
                  to="/scholarships"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  Browse Scholarships →
                </Link>
              </div>
            )}
            {user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <Link to="/scholarships" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                  🎓 Browse Scholarships
                </Link>
                <Link to="/recommendations" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  ✨ My AI Recommendations
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-slate-50 dark:fill-slate-900">
            <path d="M0,60 C240,0 480,60 720,30 C960,0 1200,45 1440,20 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {STATS.map((stat, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-lg transition-shadow animate-fadeInUp">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-md`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Choose from 6 scholarship types tailored to every student's need
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                to={`/scholarships?category=${cat.label}`}
                className="group card p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  {cat.icon}
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cat.label}</p>
                <p className="text-xs text-slate-400 mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
              ✨ Everything You Need
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Built for Student Success
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Powerful tools to discover, apply, and win scholarships from across the globe
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${f.color} ${f.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT SCHOLARSHIPS ───────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Latest Scholarships</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Fresh opportunities added regularly</p>
            </div>
            <Link to="/scholarships" className="btn-primary text-sm py-2.5 px-5">
              View All →
            </Link>
          </div>

          {loadingScholarships ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="shimmer h-5 rounded-lg w-3/4 mb-3" />
                  <div className="shimmer h-4 rounded-lg w-1/2 mb-4" />
                  <div className="shimmer h-4 rounded-lg w-full mb-2" />
                  <div className="shimmer h-4 rounded-lg w-4/5 mb-6" />
                  <div className="shimmer h-10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {recentScholarships.map(s => (
                <div key={s._id} className="scholarship-card animate-fadeInUp">
                  <div className="card-header">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`badge ${
                        s.category === 'Government' ? 'badge-green' :
                        s.category === 'Merit-Based' ? 'badge-blue' :
                        s.category === 'Need-Based' ? 'badge-yellow' :
                        s.category === 'International' ? 'badge-purple' :
                        'badge-gray'
                      }`}>
                        {s.category}
                      </span>
                      <span className="text-xs text-slate-400">🌍 {s.country}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate-2 leading-snug">{s.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">by {s.provider}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {s.currency} {s.amount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        📅 {new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <Link
                      to={`/scholarships/${s._id}`}
                      className="flex-1 text-center btn-primary text-sm py-2.5"
                    >
                      View Details
                    </Link>
                    {user && (
                      <Link
                        to={`/apply/${s._id}`}
                        className="flex-1 text-center btn-secondary text-sm py-2.5"
                      >
                        Apply Now
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400">Get a scholarship in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '👤', title: 'Create Profile', desc: 'Sign up and fill in your academic details, income range, and study goals.' },
              { step: '02', icon: '🔍', title: 'Discover', desc: 'Get AI recommendations and filter thousands of scholarships for your profile.' },
              { step: '03', icon: '📝', title: 'Apply', desc: 'Submit applications with our streamlined form and document upload system.' },
              { step: '04', icon: '🏆', title: 'Track & Win', desc: 'Monitor your applications, get notified, and celebrate your scholarship wins.' },
            ].map((s, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full mb-3">
                  Step {s.step}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      {!user && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 hero-pattern opacity-20 pointer-events-none" />
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 relative">
                Ready to Fund Your Dreams?
              </h2>
              <p className="text-blue-100 mb-8 text-lg relative max-w-xl mx-auto">
                Join 10,000+ students who found their perfect scholarship match on ScholarConnect
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <Link to="/register" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg active:scale-95" id="cta-register">
                  🚀 Create Free Account
                </Link>
                <Link to="/scholarships" className="px-8 py-4 bg-white/20 text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all">
                  Browse Scholarships →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
