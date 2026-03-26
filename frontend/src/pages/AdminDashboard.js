import React, { useState, useEffect } from 'react';
import api from '../api/api';

const TABS = ['overview', 'scholarships', 'applications', 'users'];

const AdminDashboard = () => {
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', provider: '', category: '',
    country: '', amount: '', currency: 'USD', deadline: '', educationLevel: 'Any',
    website: '', applicationProcess: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [schRes, appRes] = await Promise.all([
        api.get('/api/scholarships?limit=100'),
        api.get('/api/applications'),
      ]);
      setScholarships(schRes.data.scholarships || []);
      setApplications(appRes.data || []);
      try {
        const usersRes = await api.get('/api/auth/users');
        setUsers(usersRes.data || []);
      } catch { setUsers([]); }
    } catch {
      setScholarships([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScholarship = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/scholarships/${editingId}`, formData);
        showToast('✅ Scholarship updated!');
      } else {
        await api.post('/api/scholarships', formData);
        showToast('✅ Scholarship created!');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchAll();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Error'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scholarship?')) return;
    try {
      await api.delete(`/api/scholarships/${id}`);
      showToast('🗑️ Scholarship deleted');
      fetchAll();
    } catch { showToast('❌ Failed to delete', 'error'); }
  };

  const handleEdit = (s) => {
    setFormData({
      title: s.title, description: s.description, provider: s.provider,
      category: s.category, country: s.country, amount: s.amount,
      currency: s.currency || 'USD', deadline: s.deadline?.slice(0, 10),
      educationLevel: s.eligibility?.educationLevel || 'Any',
      website: s.website || '', applicationProcess: s.applicationProcess || '',
    });
    setEditingId(s._id);
    setShowForm(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/applications/${id}/status`, { status });
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      showToast(`Status updated to ${status}`);
    } catch {}
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', provider: '', category: '',
      country: '', amount: '', currency: 'USD', deadline: '', educationLevel: 'Any',
      website: '', applicationProcess: '',
    });
  };

  const statCards = [
    { label: 'Total Scholarships', value: scholarships.length,  icon: '🎓', bg: 'from-blue-500 to-blue-600' },
    { label: 'Total Applications', value: applications.length,  icon: '📋', bg: 'from-purple-500 to-purple-600' },
    { label: 'Pending Review',     value: applications.filter(a => a.status === 'Pending').length, icon: '⏳', bg: 'from-amber-500 to-amber-600' },
    { label: 'Accepted',           value: applications.filter(a => a.status === 'Accepted').length, icon: '✅', bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Registered Users',   value: users.length || '—', icon: '👥', bg: 'from-rose-500 to-rose-600' },
    { label: 'Active Scholarships', value: scholarships.filter(s => s.isActive).length, icon: '🟢', bg: 'from-cyan-500 to-cyan-600' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-float">⏳</div>
        <p className="text-slate-500 dark:text-slate-400">Loading admin data...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage scholarships, applications, and platform analytics</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="card p-5 text-center hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-xl mx-auto mb-2 shadow-inner`}>
                {s.icon}
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'overview' && '📊 '}
              {tab === 'scholarships' && '🎓 '}
              {tab === 'applications' && '📋 '}
              {tab === 'users' && '👥 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Category breakdown */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Scholarships by Category</h2>
              {['Academic','Need-Based','Merit-Based','International','Government','Private'].map(cat => {
                const count = scholarships.filter(s => s.category === cat).length;
                const pct = scholarships.length ? Math.round((count / scholarships.length) * 100) : 0;
                return (
                  <div key={cat} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Application status breakdown */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Application Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Pending','Reviewed','Accepted','Rejected'].map(status => {
                  const count = applications.filter(a => a.status === status).length;
                  const colors = { Pending: 'amber', Reviewed: 'blue', Accepted: 'emerald', Rejected: 'red' };
                  const c = colors[status];
                  return (
                    <div key={status} className={`bg-${c}-50 dark:bg-${c}-900/20 border border-${c}-200 dark:border-${c}-800 rounded-2xl p-5 text-center`}>
                      <div className={`text-3xl font-extrabold text-${c}-600 dark:text-${c}-400`}>{count}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Applications quick view */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Applications</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Scholarship</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map(app => (
                      <tr key={app._id}>
                        <td className="font-medium">{app.student?.name || '—'}</td>
                        <td>{app.scholarship?.title || '—'}</td>
                        <td>
                          <span className={`badge ${
                            app.status === 'Accepted' ? 'badge-green' :
                            app.status === 'Rejected' ? 'badge-red' :
                            app.status === 'Reviewed' ? 'badge-blue' :
                            'badge-yellow'
                          }`}>{app.status}</span>
                        </td>
                        <td className="text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {applications.length > 5 && (
                <button onClick={() => setActiveTab('applications')} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all {applications.length} applications →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS TAB ─────────────────────────────────────── */}
        {activeTab === 'scholarships' && (
          <div>
            {/* Add / Edit Form */}
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
                className="btn-primary"
                id="add-scholarship-btn"
              >
                {showForm && !editingId ? '✕ Cancel' : '+ Add New Scholarship'}
              </button>
            </div>

            {showForm && (
              <div className="card p-6 mb-6 border-2 border-blue-200 dark:border-blue-800 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
                  {editingId ? '✏️ Edit Scholarship' : '➕ Create Scholarship'}
                </h2>
                <form onSubmit={handleSubmitScholarship} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Title *</label>
                    <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="input" required placeholder="Scholarship title" />
                  </div>
                  <div>
                    <label className="label">Provider *</label>
                    <input value={formData.provider} onChange={e => setFormData(p => ({...p, provider: e.target.value}))} className="input" required placeholder="Organization name" />
                  </div>
                  <div>
                    <label className="label">Category *</label>
                    <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} className="input" required>
                      <option value="">Select category</option>
                      {['Academic','Need-Based','Merit-Based','International','Government','Private'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Country *</label>
                    <input value={formData.country} onChange={e => setFormData(p => ({...p, country: e.target.value}))} className="input" required placeholder="India" />
                  </div>
                  <div>
                    <label className="label">Amount *</label>
                    <input type="number" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} className="input" required placeholder="50000" />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select value={formData.currency} onChange={e => setFormData(p => ({...p, currency: e.target.value}))} className="input">
                      {['USD','INR','EUR','GBP','CAD','AUD'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Deadline *</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData(p => ({...p, deadline: e.target.value}))} className="input" required />
                  </div>
                  <div>
                    <label className="label">Education Level</label>
                    <select value={formData.educationLevel} onChange={e => setFormData(p => ({...p, educationLevel: e.target.value}))} className="input">
                      {['Any','High School','Undergraduate','Graduate','Postgraduate'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Website URL</label>
                    <input value={formData.website} onChange={e => setFormData(p => ({...p, website: e.target.value}))} className="input" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="label">Application Process</label>
                    <input value={formData.applicationProcess} onChange={e => setFormData(p => ({...p, applicationProcess: e.target.value}))} className="input" placeholder="Short description" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description *</label>
                    <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="input" rows={3} required placeholder="Describe the scholarship..." />
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button type="submit" className="btn-primary">{editingId ? '💾 Update' : '🚀 Create'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Scholarships table */}
            <div className="card overflow-hidden">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Country</th>
                      <th>Amount</th>
                      <th>Deadline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarships.map(s => (
                      <tr key={s._id}>
                        <td>
                          <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{s.title}</div>
                          <div className="text-xs text-slate-400">{s.provider}</div>
                        </td>
                        <td><span className="badge badge-blue">{s.category}</span></td>
                        <td>{s.country}</td>
                        <td className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.currency} {s.amount?.toLocaleString()}
                        </td>
                        <td className="text-slate-500">{new Date(s.deadline).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(s)} className="btn-ghost text-xs py-1.5 px-3 text-blue-600 dark:text-blue-400">
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDelete(s._id)} className="btn-ghost text-xs py-1.5 px-3 text-red-600 dark:text-red-400">
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICATIONS TAB ─────────────────────────────────────── */}
        {activeTab === 'applications' && (
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Scholarship</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id}>
                      <td>
                        <div className="font-medium text-slate-900 dark:text-white">{app.student?.name || '—'}</div>
                        <div className="text-xs text-slate-400">{app.student?.email}</div>
                      </td>
                      <td>
                        <div className="truncate max-w-[180px] font-medium">{app.scholarship?.title || '—'}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          app.status === 'Accepted' ? 'badge-green' :
                          app.status === 'Rejected' ? 'badge-red' :
                          app.status === 'Reviewed' ? 'badge-blue' :
                          'badge-yellow'
                        }`}>{app.status}</span>
                      </td>
                      <td className="text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={app.status}
                          onChange={e => handleUpdateStatus(app._id, e.target.value)}
                          className="text-sm px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {['Pending','Reviewed','Accepted','Rejected'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ──────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="card p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-slate-500 dark:text-slate-400">User management endpoint not available<br/>
                  <span className="text-sm">The /api/auth/users endpoint needs admin auth middleware</span>
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td className="font-medium">{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span></td>
                        <td className="text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
