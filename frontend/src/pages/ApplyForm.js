import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const ApplyForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [formData, setFormData] = useState({
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    country: user?.profile?.country || '',
    dateOfBirth: user?.profile?.dateOfBirth?.slice(0, 10) || '',
    education: {
      currentLevel: '',
      university: user?.profile?.university || '',
      gpa: user?.profile?.gpa || '',
      major: user?.profile?.course || '',
    },
    applicationLetter: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get(`/api/scholarships/${id}`)
      .then(res => setScholarship(res.data))
      .catch(() => {});
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('education.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, education: { ...prev.education, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/applications', {
        scholarship: id,
        personalInfo: {
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          dateOfBirth: formData.dateOfBirth,
          education: {
            currentLevel: formData.education.currentLevel,
            university: formData.education.university,
            gpa: parseFloat(formData.education.gpa),
            major: formData.education.major,
          },
        },
        applicationLetter: formData.applicationLetter,
      });
      navigate('/my-applications', { state: { applied: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Personal', icon: '👤' },
    { id: 2, label: 'Education', icon: '🎓' },
    { id: 3, label: 'Statement', icon: '📝' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/scholarships" className="hover:text-blue-600">Scholarships</Link>
          <span>/</span>
          {scholarship && <Link to={`/scholarships/${id}`} className="hover:text-blue-600 truncate max-w-xs">{scholarship.title}</Link>}
          <span>/</span>
          <span>Apply</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Apply for Scholarship</h1>
          {scholarship && (
            <div className="card p-4 flex items-center gap-4 mt-4 border-l-4 border-blue-500">
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white">{scholarship.title}</p>
                <p className="text-sm text-slate-500">{scholarship.provider} · 🌍 {scholarship.country}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Amount</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                  {scholarship.currency} {scholarship.amount?.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : step > s.id
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-pointer'
                      : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <span>{step > s.id ? '✓' : s.icon}</span>
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1 - Personal */}
          {step === 1 && (
            <div className="card p-8 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">👤 Personal Information</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Pre-filled from your profile. Update as needed.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Phone Number *</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} required className="input" placeholder="+91 99999 99999" type="tel" />
                </div>
                <div>
                  <label className="label">Date of Birth *</label>
                  <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="input" type="date" />
                </div>
                <div>
                  <label className="label">Address *</label>
                  <input name="address" value={formData.address} onChange={handleChange} required className="input" placeholder="123 Main St, City" />
                </div>
                <div>
                  <label className="label">Country *</label>
                  <input name="country" value={formData.country} onChange={handleChange} required className="input" placeholder="India" />
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary mt-6 px-8 py-3">
                Next: Education →
              </button>
            </div>
          )}

          {/* STEP 2 - Education */}
          {step === 2 && (
            <div className="card p-8 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🎓 Education Details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Academic information for eligibility verification.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Current Education Level *</label>
                  <select name="education.currentLevel" value={formData.education.currentLevel} onChange={handleChange} required className="input">
                    <option value="">Select level</option>
                    <option>High School</option>
                    <option>Undergraduate</option>
                    <option>Graduate</option>
                    <option>Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="label">GPA / Percentage *</label>
                  <input name="education.gpa" value={formData.education.gpa} onChange={handleChange} required className="input" type="number" step="0.01" min="0" max="10" placeholder="8.5" />
                </div>
                <div>
                  <label className="label">University / College *</label>
                  <input name="education.university" value={formData.education.university} onChange={handleChange} required className="input" placeholder="IIT Delhi" />
                </div>
                <div>
                  <label className="label">Major / Course *</label>
                  <input name="education.major" value={formData.education.major} onChange={handleChange} required className="input" placeholder="Computer Science" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary px-6 py-3">← Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary px-8 py-3">Next: Statement →</button>
              </div>
            </div>
          )}

          {/* STEP 3 - Application Letter */}
          {step === 3 && (
            <div className="card p-8 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">📝 Application Statement</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Write a compelling statement explaining why you deserve this scholarship (min. 150 words recommended)
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-5 text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tips:</strong> Mention your achievements, financial need, career goals, and how this scholarship will help you. Be specific and genuine.
              </div>
              <textarea
                name="applicationLetter"
                value={formData.applicationLetter}
                onChange={handleChange}
                rows={10}
                required
                placeholder="Dear Scholarship Committee,&#10;&#10;I am applying for this scholarship because..."
                className="input font-mono text-sm leading-relaxed"
                id="application-letter"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {formData.applicationLetter.split(' ').filter(Boolean).length} words
              </p>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary px-6 py-3">← Back</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-3 flex-1"
                  id="submit-application"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : '🚀 Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplyForm;
