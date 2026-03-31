import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/api';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return feedbacks;
    return feedbacks.filter((item) =>
      [item.name, item.email, item.subject, item.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [feedbacks, query]);

  const avgRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl border border-indigo-200/60 dark:border-indigo-700/40 bg-gradient-to-r from-indigo-600 to-blue-700 p-5 sm:p-6 text-white shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-extrabold">Feedback Inbox</h1>
          <p className="text-indigo-100 mt-1">Review student ratings, ideas, and bug reports</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Feedback</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{feedbacks.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Average Rating</p>
            <p className="text-2xl font-extrabold text-amber-500">{avgRating} ⭐</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Filtered Results</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredFeedbacks.length}</p>
          </div>
        </div>

        <div className="card p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, subject, message..."
              className="input text-sm"
            />
            <button type="button" onClick={loadFeedback} className="btn-secondary whitespace-nowrap">
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="card p-10 text-center text-slate-500 dark:text-slate-400">Loading feedback...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-500 dark:text-slate-400">No feedback available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((fb) => (
              <div key={fb._id} className="card p-5 border border-slate-200/70 dark:border-slate-700/70">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{fb.name}</p>
                    <p className="text-sm text-slate-500">{fb.email}</p>
                    <p className="text-xs mt-1 text-slate-400">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-blue">{fb.subject || 'General'}</span>
                    <span className="badge badge-yellow">{Number(fb.rating || 0)} ⭐</span>
                  </div>
                </div>
                <p className="mt-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;