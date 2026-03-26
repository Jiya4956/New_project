import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="text-xl font-extrabold text-white">ScholarConnect</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Helping students discover, apply, and track scholarships worldwide. Your future starts here.
            </p>
            <div className="flex gap-3">
              {['🐦', '💼', '📘', '📸'].map((icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-lg">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/scholarships', label: 'Browse Scholarships' },
                { to: '/recommendations', label: 'AI Recommendations' },
                { to: '/forum', label: 'Discussion Forum' },
                { to: '/my-applications', label: 'My Applications' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Categories</h4>
            <ul className="space-y-2.5">
              {['Merit-Based', 'Need-Based', 'Government', 'International', 'Academic', 'Private'].map(cat => (
                <li key={cat}>
                  <Link to={`/scholarships?category=${cat}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/feedback', label: 'Submit Feedback' },
                { to: '/register', label: 'Create Account' },
                { to: '/login', label: 'Sign In' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter CTA */}
            <div className="mt-6 p-4 bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 mb-3">Get deadline alerts in your inbox</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 text-xs bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium">
                  ✓
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} ScholarConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-600">Privacy Policy</span>
            <span className="text-xs text-slate-600">Terms of Service</span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
