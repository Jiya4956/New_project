import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const CATEGORIES = ['Academic', 'Need-Based', 'Merit-Based', 'International', 'Government', 'Private'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const EDUCATION_LEVELS = ['Any', 'High School', 'Undergraduate', 'Graduate', 'Postgraduate'];

const initialForm = {
  title: '',
  provider: '',
  category: '',
  country: '',
  amount: '',
  currency: 'INR',
  deadline: '',
  educationLevel: 'Any',
  website: '',
  applicationProcess: '',
  description: '',
  contactEmail: '',
  documents: '',
};

const AddScholarship = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.provider.trim())    e.provider    = 'Provider is required';
    if (!form.category)           e.category    = 'Category is required';
    if (!form.country.trim())     e.country     = 'Country is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
                                  e.amount      = 'A valid amount is required';
    if (!form.deadline)           e.deadline    = 'Deadline is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        documents: form.documents
          ? form.documents.split(',').map(d => d.trim()).filter(Boolean)
          : [],
      };
      await api.post('/api/scholarships', payload);
      showToast('🎉 Scholarship added successfully! Students can now apply.');
      setTimeout(() => navigate('/admin'), 1800);
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to add scholarship'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear all fields?')) {
      setForm(initialForm);
      setErrors({});
    }
  };

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium animate-slideInRight max-w-sm ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
          Back to Admin Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
              🎓
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Add New Scholarship
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Fill in the details below — students will be able to see and apply once published.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Basic Info ─────────────────────────────── */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <span className="text-xl">📝</span> Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <Field label="Scholarship Title" required error={errors.title}>
                  <input
                    id="scholarship-title"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. National Merit Scholarship 2025"
                    className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                </Field>
              </div>

              <Field label="Provider / Organization" required error={errors.provider}>
                <input
                  id="scholarship-provider"
                  value={form.provider}
                  onChange={e => set('provider', e.target.value)}
                  placeholder="e.g. Ministry of Education"
                  className={`input ${errors.provider ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </Field>

              <Field label="Category" required error={errors.category}>
                <select
                  id="scholarship-category"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className={`input ${errors.category ? 'border-red-400 focus:ring-red-400' : ''}`}
                >
                  <option value="">— Select a category —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Country" required error={errors.country}>
                <input
                  id="scholarship-country"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  placeholder="e.g. India"
                  className={`input ${errors.country ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </Field>

              <Field label="Education Level">
                <select
                  id="scholarship-education-level"
                  value={form.educationLevel}
                  onChange={e => set('educationLevel', e.target.value)}
                  className="input"
                >
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>

            </div>
          </div>

          {/* ── Section 2: Amount & Deadline ─────────────────────── */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <span className="text-xl">💰</span> Amount & Deadline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              <Field label="Scholarship Amount" required error={errors.amount}>
                <input
                  id="scholarship-amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="50000"
                  className={`input ${errors.amount ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </Field>

              <Field label="Currency">
                <select
                  id="scholarship-currency"
                  value={form.currency}
                  onChange={e => set('currency', e.target.value)}
                  className="input"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Application Deadline" required error={errors.deadline}>
                <input
                  id="scholarship-deadline"
                  type="date"
                  value={form.deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('deadline', e.target.value)}
                  className={`input ${errors.deadline ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </Field>

            </div>
          </div>

          {/* ── Section 3: Links & Process ────────────────────────── */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <span className="text-xl">🔗</span> Links & Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Official Website URL">
                <input
                  id="scholarship-website"
                  type="url"
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                  placeholder="https://scholarship.example.gov.in"
                  className="input"
                />
              </Field>

              <Field label="Contact Email">
                <input
                  id="scholarship-contact-email"
                  type="email"
                  value={form.contactEmail}
                  onChange={e => set('contactEmail', e.target.value)}
                  placeholder="contact@organization.org"
                  className="input"
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Application Process">
                  <input
                    id="scholarship-application-process"
                    value={form.applicationProcess}
                    onChange={e => set('applicationProcess', e.target.value)}
                    placeholder="e.g. Online form → Interview → Document submission"
                    className="input"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Required Documents">
                  <input
                    id="scholarship-documents"
                    value={form.documents}
                    onChange={e => set('documents', e.target.value)}
                    placeholder="Separate by commas: Marksheet, Aadhar Card, Income Certificate"
                    className="input"
                  />
                  <p className="mt-1 text-xs text-slate-400">Enter each document name separated by a comma.</p>
                </Field>
              </div>

            </div>
          </div>

          {/* ── Section 4: Description ────────────────────────────── */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <span className="text-xl">📄</span> Description
            </h2>
            <Field label="Full Description" required error={errors.description}>
              <textarea
                id="scholarship-description"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={5}
                placeholder="Describe the scholarship — eligibility criteria, benefits, who can apply, etc."
                className={`input resize-y ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>
          </div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              type="submit"
              disabled={loading}
              id="submit-scholarship-btn"
              className="btn-primary flex-1 sm:flex-none sm:px-10 py-3.5 text-base disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Publishing...
                </span>
              ) : '🚀 Publish Scholarship'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary flex-1 sm:flex-none sm:px-8 py-3.5 text-base"
            >
              🔄 Reset Form
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn-ghost flex-1 sm:flex-none sm:px-8 py-3.5 text-base"
            >
              ✕ Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddScholarship;
