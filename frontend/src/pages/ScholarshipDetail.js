import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const EXCHANGE_RATES = { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, CAD: 1.37, AUD: 1.55, JPY: 150, CNY: 7.2 };
const CURRENCIES = Object.keys(EXCHANGE_RATES);

const ScholarshipDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchScholarship(); }, [id]);
  useEffect(() => {
    if (user && scholarship) checkStatus();
  }, [user, scholarship, checkStatus]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchScholarship = async () => {
    try {
      const res = await api.get(`/api/scholarships/${id}`);
      setScholarship(res.data);
    } catch { } finally { setLoading(false); }
  };

  const checkStatus = async () => {
    try {
      const [bookmarksRes, appsRes] = await Promise.all([
        api.get('/api/bookmarks'),
        api.get('/api/applications/my'),
      ]);
      const bms = bookmarksRes.data || [];
      setBookmarked(bms.some(b => (b.scholarship?._id || b.scholarship) === id));
      const apps = appsRes.data || [];
      setApplied(apps.some(a => (a.scholarship?._id || a.scholarship) === id));
    } catch {}
  };

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await api.delete(`/api/bookmarks/${id}`);
        setBookmarked(false);
        showToast('Bookmark removed');
      } else {
        await api.post('/api/bookmarks', { scholarshipId: id });
        setBookmarked(true);
        showToast('Scholarship bookmarked! 🔖');
      }
    } catch { showToast('Something went wrong', 'error'); }
    finally { setBookmarkLoading(false); }
  };

  const getConvertedAmount = () => {
    if (!scholarship) return 0;
    const baseAmount = scholarship.amount;
    const baseCurrency = scholarship.currency || 'USD';
    const inUSD = baseAmount / (EXCHANGE_RATES[baseCurrency] || 1);
    return (inUSD * (EXCHANGE_RATES[currency] || 1)).toFixed(0);
  };

  const daysLeft = scholarship ? Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  if (loading) return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="card p-8">
          <div className="shimmer h-6 rounded w-1/4 mb-4" />
          <div className="shimmer h-10 rounded w-3/4 mb-3" />
          <div className="shimmer h-6 rounded w-1/2 mb-8" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!scholarship) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Scholarship Not Found</h2>
        <Link to="/scholarships" className="btn-primary">← Back to Listings</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/scholarships" className="hover:text-blue-600">Scholarships</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{scholarship.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`badge ${
                      scholarship.category === 'Government' ? 'badge-green' :
                      scholarship.category === 'Merit-Based' ? 'badge-blue' :
                      scholarship.category === 'Need-Based' ? 'badge-yellow' :
                      scholarship.category === 'International' ? 'badge-purple' :
                      'badge-gray'
                    }`}>{scholarship.category}</span>
                    {daysLeft > 0 && daysLeft <= 30 && (
                      <span className="badge badge-red">⏰ {daysLeft} days left</span>
                    )}
                    {daysLeft <= 0 && <span className="badge badge-red">Expired</span>}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                    {scholarship.title}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">{scholarship.provider}</p>
                  <p className="text-sm text-slate-400 mt-1">🌍 {scholarship.country}</p>
                </div>
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border-2 flex-shrink-0 ${
                    bookmarked
                      ? 'bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-900/20 dark:border-amber-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-600'
                  }`}
                  title={bookmarked ? 'Remove bookmark' : 'Save for later'}
                >
                  {bookmarkLoading ? '...' : bookmarked ? '🔖' : '🏷️'}
                </button>
              </div>

              {/* Currency converter */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1 uppercase tracking-wide">Scholarship Amount</p>
                    <div className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-300">
                      {currency} {Number(getConvertedAmount()).toLocaleString()}
                    </div>
                    {currency !== scholarship.currency && (
                      <p className="text-xs text-emerald-500 mt-1">
                        Original: {scholarship.currency} {scholarship.amount?.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Convert to</p>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{scholarship.description}</p>
            </div>

            {/* Eligibility */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                ✅ Eligibility Criteria
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {scholarship.eligibility?.educationLevel && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Education Level</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{scholarship.eligibility.educationLevel}</p>
                    </div>
                  </div>
                )}
                {scholarship.eligibility?.gpaMin && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Minimum GPA</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{scholarship.eligibility.gpaMin}</p>
                    </div>
                  </div>
                )}
                {scholarship.eligibility?.ageMin && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <span className="text-2xl">🎂</span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Age Range</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{scholarship.eligibility.ageMin} – {scholarship.eligibility.ageMax || '∞'} years</p>
                    </div>
                  </div>
                )}
              </div>
              {scholarship.eligibility?.requirements?.length > 0 && (
                <ul className="space-y-2">
                  {scholarship.eligibility.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Documents */}
            {scholarship.documents?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📄 Required Documents</h2>
                <ul className="space-y-2">
                  {scholarship.documents.map((doc, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-blue-500">📋</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Process */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">🔄 Application Process</h2>
              <p className="text-slate-700 dark:text-slate-300">{scholarship.applicationProcess}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Info */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Info</h3>
              <div className="space-y-4">
                {[
                  { icon: '📅', label: 'Deadline', value: new Date(scholarship.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
                  { icon: '🌍', label: 'Country', value: scholarship.country },
                  { icon: '📂', label: 'Category', value: scholarship.category },
                  { icon: '🎓', label: 'Level', value: scholarship.eligibility?.educationLevel || 'Any' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadline Progress */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Deadline</h3>
              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{ width: daysLeft > 0 ? `${Math.min(100, 100 - (daysLeft / 365) * 100)}%` : '100%' }}
                />
              </div>
              <p className={`text-sm font-semibold ${
                daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
              </p>
            </div>

            {/* Apply CTA */}
            <div className="card p-6">
              {applied ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-semibold text-emerald-600 mb-1">Already Applied!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Track your application status</p>
                  <Link to="/my-applications" className="btn-primary w-full text-center text-sm py-3">
                    View My Applications
                  </Link>
                </div>
              ) : user ? (
                <>
                  <Link
                    to={`/apply/${id}`}
                    className="btn-primary w-full text-center py-3 text-base font-bold mb-3"
                    id="apply-now-btn"
                  >
                    🚀 Apply Now
                  </Link>
                  <button
                    onClick={handleBookmark}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all border ${
                      bookmarked
                        ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700'
                    }`}
                  >
                    {bookmarked ? '🔖 Bookmarked' : '🏷️ Save for Later'}
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary w-full text-center py-3 text-base font-bold" id="login-to-apply">
                  🔐 Login to Apply
                </Link>
              )}

              {scholarship.website && (
                <a
                  href={scholarship.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  🔗 Official Website
                </a>
              )}
            </div>

            {/* Contact */}
            {(scholarship.contactEmail || scholarship.contactPhone) && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">📞 Contact</h3>
                {scholarship.contactEmail && (
                  <a href={`mailto:${scholarship.contactEmail}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-2">
                    ✉️ {scholarship.contactEmail}
                  </a>
                )}
                {scholarship.contactPhone && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">📱 {scholarship.contactPhone}</p>
                )}
              </div>
            )}

            <Link to="/scholarships" className="btn-secondary w-full text-center py-3 text-sm">
              ← Back to Scholarships
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
