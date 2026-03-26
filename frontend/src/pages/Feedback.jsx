import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const RATINGS = [1, 2, 3, 4, 5];
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const Feedback = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
    rating: 5,
    subject: 'General',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/feedback', form);
      setSubmitted(true);
      setForm(prev => ({ ...prev, message: '', subject: 'General', rating: 5 }));
    } catch {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Share Your Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400">Help us improve ScholarConnect for all students</p>
        </div>

        {submitted ? (
          <div className="card p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Your feedback has been submitted successfully. We appreciate your input!</p>
            <button onClick={() => setSubmitted(false)} className="btn-primary px-8 py-3">
              Submit Another
            </button>
          </div>
        ) : (
          <div className="card p-8">
            {error && (
              <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Your Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input" placeholder="John Doe" required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input" placeholder="you@example.com" required
                  />
                </div>
              </div>

              <div>
                <label className="label">Subject</label>
                <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input">
                  {['General', 'Scholarship Listings', 'Application Process', 'UI/Design', 'Bug Report', 'Feature Request'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Rating</label>
                <div className="flex items-center gap-2">
                  {RATINGS.map(r => (
                    <button
                      key={r} type="button"
                      onClick={() => setForm(p => ({ ...p, rating: r }))}
                      className={`w-12 h-12 rounded-xl text-xl transition-all border-2 ${
                        form.rating === r
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 scale-110'
                          : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-amber-500 ml-2">
                    {RATING_LABELS[form.rating]}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Your Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="input" rows={6}
                  placeholder="Tell us about your experience, suggestions, or any issues you faced..."
                  required
                  id="feedback-message"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base" id="submit-feedback">
                {loading ? '⏳ Submitting...' : '📨 Submit Feedback'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;