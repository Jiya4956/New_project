import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '../components/ui/select';

const CATEGORY_OPTS = ['', 'Academic', 'Need-Based', 'Merit-Based', 'International', 'Government', 'Private'];
const EDUCATION_OPTS = ['', 'High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Any'];
const SORT_OPTS = [
  { label: 'Newest First',   value: '-createdAt' },
  { label: 'Oldest First',   value: 'createdAt' },
  { label: 'Amount (High)',  value: '-amount' },
  { label: 'Amount (Low)',   value: 'amount' },
  { label: 'Deadline Soon',  value: 'deadline' },
];

const CATEGORY_COLORS = {
  'Academic':      'badge-blue',
  'Need-Based':    'badge-yellow',
  'Merit-Based':   'badge-blue',
  'International': 'badge-purple',
  'Government':    'badge-green',
  'Private':       'badge-gray',
  'Other':         'badge-gray',
};

const ScholarshipCard = ({ s, onBookmark, bookmarked, applied }) => {
  const { user } = useAuth();
  const daysLeft = Math.ceil((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="card p-5 animate-fadeInUp border border-slate-200/70 dark:border-slate-700/70">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`badge ${CATEGORY_COLORS[s.category] || 'badge-gray'}`}>
              {s.category}
            </span>
            {applied && <span className="badge badge-green text-xs">✓ Applied</span>}
            {daysLeft <= 30 && daysLeft > 0 && <span className="badge badge-red text-xs">⏰ {daysLeft}d left</span>}
            {daysLeft <= 0 && <span className="badge badge-red text-xs">Expired</span>}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug truncate-2">{s.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{s.provider}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 flex flex-wrap items-center gap-1">
            <span>🌍</span> {s.country}
            {s.eligibility?.educationLevel && s.eligibility.educationLevel !== 'Any' && (
              <><span className="mx-1">·</span><span>🎓 {s.eligibility.educationLevel}</span></>
            )}
          </p>
        </div>

        <div className="lg:w-[320px] flex-shrink-0">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Amount</p>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {s.currency} {s.amount?.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-0.5">Deadline</p>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/scholarships/${s._id}`} className="btn-primary text-sm py-2.5 flex-1 text-center">
              Details
            </Link>
            {user && !applied && (
              <Link to={`/apply/${s._id}`} className="btn-secondary text-sm py-2.5 flex-1 text-center">
                Apply
              </Link>
            )}
            {user && applied && (
              <span className="inline-flex items-center justify-center gap-1.5 text-sm py-2.5 flex-1 text-center font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-default">
                ✅ Applied
              </span>
            )}
            {user && (
              <button
                onClick={() => onBookmark(s._id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                  bookmarked
                    ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-900/20 dark:border-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-amber-50 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-amber-900/20'
                }`}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                {bookmarked ? '🔖' : '🏷️'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScholarshipList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [appliedScholarships, setAppliedScholarships] = useState([]);
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    country: '',
    search: queryParams.get('search') || '',
    educationLevel: '',
    sort: '-createdAt',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/api/scholarships', { params });
      setScholarships(res.data.scholarships || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  useEffect(() => {
    if (user) {
      api.get('/api/bookmarks').then(res => {
        setBookmarks((res.data || []).map(b => b.scholarship?._id || b.scholarship));
      }).catch(() => {});

      // Fetch user's applications to disable apply button
      api.get('/api/applications/my').then(res => {
        const ids = (res.data || []).map(a => a.scholarship?._id || a.scholarshipId);
        setAppliedScholarships(ids);
      }).catch(() => {});
    }
  }, [user]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleBookmark = async (id) => {
    if (!user) { navigate('/login'); return; }
    try {
      if (bookmarks.includes(id)) {
        await api.delete(`/api/bookmarks/${id}`);
        setBookmarks(prev => prev.filter(b => b !== id));
      } else {
        await api.post('/api/bookmarks', { scholarshipId: id });
        setBookmarks(prev => [...prev, id]);
      }
    } catch {}
  };

  const clearFilters = () => {
    setFilters({ category: '', country: '', search: '', educationLevel: '', sort: '-createdAt' });
    setPage(1);
  };

  const activeFilterCount = [filters.category, filters.country, filters.search, filters.educationLevel].filter(Boolean).length;
  const categoryValue = filters.category || 'all';
  const educationValue = filters.educationLevel || 'all';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Browse Scholarships
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {loading ? 'Loading...' : `${total.toLocaleString()} scholarships found`}
          </p>
        </div>

        {/* Top filter bar */}
        <div className="card p-4 mb-6 sticky top-20 z-20">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Search by title, provider, country..."
                className="input text-sm"
                id="scholarship-search-top"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row gap-2">
              <Select value={categoryValue} onValueChange={(v) => handleFilterChange('category', v === 'all' ? '' : v)}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTS.filter(Boolean).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={educationValue} onValueChange={(v) => handleFilterChange('educationLevel', v === 'all' ? '' : v)}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="Any Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Level</SelectItem>
                  {EDUCATION_OPTS.filter(Boolean).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.sort} onValueChange={(v) => handleFilterChange('sort', v)}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setFiltersOpen(!filtersOpen)} className="text-sm px-4 py-2.5">
                More Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Button>
            </div>
          </div>
          {filtersOpen && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                value={filters.country}
                onChange={e => handleFilterChange('country', e.target.value)}
                placeholder="Country (e.g. India)"
                className="input text-sm"
              />
              <Button variant="outline" onClick={clearFilters} className="text-sm py-2.5">
                ✕ Clear All Filters
              </Button>
            </div>
          )}
        </div>
        <main>
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.search && (
                  <span className="badge badge-blue flex items-center gap-1">
                    🔍 "{filters.search}"
                    <button onClick={() => handleFilterChange('search', '')} className="ml-1 hover:text-blue-900">✕</button>
                  </span>
                )}
                {filters.category && (
                  <span className="badge badge-purple flex items-center gap-1">
                    📂 {filters.category}
                    <button onClick={() => handleFilterChange('category', '')} className="ml-1">✕</button>
                  </span>
                )}
                {filters.country && (
                  <span className="badge badge-green flex items-center gap-1">
                    🌍 {filters.country}
                    <button onClick={() => handleFilterChange('country', '')} className="ml-1">✕</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="shimmer h-5 rounded w-1/3 mb-3" />
                    <div className="shimmer h-5 rounded w-3/4 mb-2" />
                    <div className="shimmer h-4 rounded w-1/2 mb-4" />
                    <div className="shimmer h-8 rounded-xl w-full mt-auto" />
                  </div>
                ))}
              </div>
            ) : scholarships.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No scholarships found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {scholarships.map(s => (
                    <ScholarshipCard
                      key={s._id}
                      s={s}
                      onBookmark={handleBookmark}
                      bookmarked={bookmarks.includes(s._id)}
                      applied={appliedScholarships.includes(s._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                    >
                      ← Prev
                    </button>
                    {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            p === page
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
        </main>
      </div>
    </div>
  );
};

export default ScholarshipList;
