import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Recommendations = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    course: user?.profile?.course || '',
    marks: user?.profile?.marks || '',
    income: user?.profile?.income || '',
    category: user?.profile?.category || '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const res = await api.post('/api/recommendations/recommend', profile);
      setResults(Array.isArray(res.data) ? res.data : []);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
            ✨ Powered by AI
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            AI Scholarship Recommendations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Fill in your academic profile and let our AI engine find the best matching scholarships for you instantly
          </p>
        </div>

        {/* Profile Form */}
        <div className="card p-8 max-w-2xl mx-auto mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            👤 Your Profile
          </h2>
          {user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-sm text-blue-700 dark:text-blue-300">
              💡 We pre-filled your profile from your account. Update your full profile in{' '}
              <Link to="/profile" className="underline font-semibold">My Profile</Link> for better matches.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="label">🎓 Course / Program</label>
              <input
                name="course" value={profile.course} onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science" className="input"
                id="rec-course"
              />
            </div>
            <div>
              <label className="label">📊 Marks / GPA (%)</label>
              <input
                name="marks" value={profile.marks} onChange={handleChange}
                placeholder="e.g. 85" type="number" className="input"
                id="rec-marks"
              />
            </div>
            <div>
              <label className="label">💰 Annual Family Income</label>
              <select name="income" value={profile.income} onChange={handleChange} className="input" id="rec-income">
                <option value="">Select range</option>
                <option value="below-1L">Below ₹1 Lakh</option>
                <option value="1L-2.5L">₹1L – ₹2.5L</option>
                <option value="2.5L-5L">₹2.5L – ₹5L</option>
                <option value="5L-8L">₹5L – ₹8L</option>
                <option value="8L-12L">₹8L – ₹12L</option>
                <option value="above-12L">Above ₹12 Lakh</option>
              </select>
            </div>
            <div>
              <label className="label">📂 Preferred Category</label>
              <select name="category" value={profile.category} onChange={handleChange} className="input" id="rec-category">
                <option value="">Any Category</option>
                <option value="Merit-Based">Merit-Based</option>
                <option value="Need-Based">Need-Based</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>

          <button
            onClick={getRecommendations}
            disabled={loading}
            className="btn-primary w-full py-4 text-base font-bold"
            id="get-recommendations-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finding your matches...
              </span>
            ) : '✨ Get AI Recommendations'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {results.length > 0
                  ? `✨ ${results.length} Recommended for You`
                  : '😕 No Matches Found'
                }
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="card p-16 text-center max-w-lg mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No matches found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Try adjusting your profile filters or{' '}
                  <Link to="/scholarships" className="text-blue-600 hover:underline">browse all scholarships</Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {results.map(sch => {
                  const daysLeft = Math.ceil((new Date(sch.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={sch._id} className="scholarship-card animate-fadeInUp">
                      <div className="card-header">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="badge badge-purple">✨ Recommended</span>
                          {sch.category && <span className="badge badge-blue">{sch.category}</span>}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate-2 text-base leading-snug">
                          {sch.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{sch.provider}</p>
                        <p className="text-xs text-slate-400 mb-3">🌍 {sch.country}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-slate-400 mb-0.5">Amount</p>
                            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                              {sch.currency} {sch.amount?.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-0.5">Deadline</p>
                            <p className={`text-sm font-semibold ${daysLeft <= 30 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                              {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <Link to={`/scholarships/${sch._id}`} className="btn-primary text-sm py-2.5 flex-1 text-center">
                          View Details
                        </Link>
                        <Link to={`/apply/${sch._id}`} className="btn-secondary text-sm py-2.5 flex-1 text-center">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty initial state */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-float">🎯</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Personalized Just for You</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter your academic details above and our AI will instantly match you with the most relevant scholarships from our database
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;