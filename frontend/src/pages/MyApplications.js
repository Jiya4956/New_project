import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Link } from 'react-router-dom';

const STATUS_MAP = {
  Pending:  { label: 'Pending',  cls: 'status-pending',  icon: '⏳' },
  Reviewed: { label: 'Reviewed', cls: 'status-reviewed', icon: '👀' },
  Accepted: { label: 'Accepted', cls: 'status-approved', icon: '✅' },
  Rejected: { label: 'Rejected', cls: 'status-rejected', icon: '❌' },
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [appsRes, bmsRes] = await Promise.all([
        api.get('/api/applications/my'),
        api.get('/api/bookmarks'),
      ]);
      setApplications(appsRes.data || []);
      setBookmarks(bmsRes.data || []);
    } catch {
      setApplications([]);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (scholarshipId) => {
    try {
      await api.delete(`/api/bookmarks/${scholarshipId}`);
      setBookmarks(prev => prev.filter(b => (b.scholarship?._id || b.scholarship) !== scholarshipId));
    } catch {}
  };

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === 'Pending').length,
    accepted: applications.filter(a => a.status === 'Accepted').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">My Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name?.split(' ')[0]}! 👋</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied',  value: stats.total,    icon: '📋', color: 'from-blue-500 to-blue-600' },
            { label: 'Pending',        value: stats.pending,  icon: '⏳', color: 'from-amber-500 to-amber-600' },
            { label: 'Accepted',       value: stats.accepted, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Saved',          value: bookmarks.length, icon: '🔖', color: 'from-purple-500 to-purple-600' },
          ].map((s, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-inner`}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 w-fit">
          {[
            { id: 'applications', label: `📋 Applications (${stats.total})` },
            { id: 'bookmarks',    label: `🔖 Saved (${bookmarks.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4 animate-float">⏳</div>
            <p className="text-slate-500 dark:text-slate-400">Loading your data...</p>
          </div>
        ) : activeTab === 'applications' ? (
          <>
            {/* Filter pills */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['All', 'Pending', 'Reviewed', 'Accepted', 'Rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    filter === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-200'
                  }`}
                >
                  {f} {f !== 'All' && `(${applications.filter(a => a.status === f).length})`}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {filter === 'All' ? 'No Applications Yet' : `No ${filter} Applications`}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {filter === 'All'
                    ? "You haven't applied to any scholarships yet. Start browsing!"
                    : `You have no ${filter.toLowerCase()} applications at this time.`
                  }
                </p>
                <Link to="/scholarships" className="btn-primary">Browse Scholarships →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(app => {
                  const status = STATUS_MAP[app.status] || STATUS_MAP.Pending;
                  const daysLeft = Math.ceil((new Date(app.scholarship?.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={app._id} className="card p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={status.cls}>
                              {status.icon} {status.label}
                            </span>
                            {app.scholarship?.category && (
                              <span className="badge badge-gray">{app.scholarship.category}</span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                            {app.scholarship?.title || 'Scholarship'}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {app.scholarship?.provider} · 🌍 {app.scholarship?.country}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                            {daysLeft > 0 && (
                              <span className={daysLeft <= 30 ? 'text-amber-500' : ''}>
                                📅 {daysLeft}d to deadline
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {app.scholarship?.amount && (
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Amount</p>
                              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                                {app.scholarship.currency} {app.scholarship.amount?.toLocaleString()}
                              </p>
                            </div>
                          )}
                          <Link
                            to={`/scholarships/${app.scholarship?._id}`}
                            className="btn-secondary text-sm py-2 px-4 whitespace-nowrap"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Bookmarks Tab */
          bookmarks.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-6xl mb-4">🔖</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Saved Scholarships</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Save scholarships while browsing to review them later.</p>
              <Link to="/scholarships" className="btn-primary">Browse Scholarships →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map(bm => {
                const s = bm.scholarship;
                if (!s) return null;
                const sid = s._id || s;
                return (
                  <div key={sid} className="card p-6 flex gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {s.category && <span className="badge badge-blue">{s.category}</span>}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate-2">{s.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{s.provider}</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {s.currency} {s.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/scholarships/${sid}`} className="btn-primary text-sm py-2 px-4 text-center">
                        View
                      </Link>
                      <Link to={`/apply/${sid}`} className="btn-secondary text-sm py-2 px-4 text-center">
                        Apply
                      </Link>
                      <button
                        onClick={() => removeBookmark(sid)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyApplications;
