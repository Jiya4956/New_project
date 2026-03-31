import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { ChronoSelect } from '../components/ui/chrono-select';

const COURSE_OPTIONS = [
  'Class 10',
  'Class 12',
  'Diploma (Polytechnic)',
  'ITI',
  'B.Tech Computer Science',
  'B.Tech Information Technology',
  'B.Tech Artificial Intelligence',
  'B.Tech Data Science',
  'B.Tech Electronics and Communication',
  'B.Tech Electrical Engineering',
  'B.Tech Mechanical Engineering',
  'B.Tech Civil Engineering',
  'B.Tech Chemical Engineering',
  'B.Tech Aerospace Engineering',
  'B.Tech Biotechnology',
  'B.Tech Agricultural Engineering',
  'B.Arch',
  'B.Plan',
  'MBBS',
  'BDS',
  'BAMS',
  'BHMS',
  'BUMS',
  'BPT',
  'BOT',
  'B.Sc Nursing',
  'GNM Nursing',
  'B.Pharm',
  'D.Pharm',
  'B.Sc',
  'B.Com',
  'BA',
  'BBA',
  'BCA',
  'LLB',
  'BA LLB',
  'BBA LLB',
  'M.Tech',
  'MCA',
  'MBA',
  'M.Com',
  'MA',
  'M.Sc',
  'LLM',
  'PhD',
  'Other',
];
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const getDocumentMeta = (docEntry) => {
  if (!docEntry) return null;
  if (typeof docEntry === 'string') {
    return {
      url: docEntry,
      originalName: docEntry.split('/').pop() || 'Uploaded file',
      mimetype: '',
    };
  }
  return {
    url: docEntry.url || '',
    originalName: docEntry.originalName || docEntry.filename || 'Uploaded file',
    mimetype: docEntry.mimetype || '',
  };
};

const getDocumentUrl = (docEntry) => {
  if (!docEntry) return '';
  if (typeof docEntry === 'string') return docEntry.trim();
  return String(docEntry.url || '').trim();
};

const ApplyForm = () => {
  const { id } = useParams();
  const { user, fetchUser } = useAuth();
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
    documents: {},
    applicationLetter: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get(`/api/scholarships/${id}`)
      .then(res => setScholarship(res.data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const syncLatestProfile = async () => {
      const freshUser = await fetchUser();
      if (!freshUser) return;
      setFormData(prev => ({
        ...prev,
        phone: freshUser.profile?.phone || '',
        address: freshUser.profile?.address || '',
        country: freshUser.profile?.country || '',
        dateOfBirth: freshUser.profile?.dateOfBirth?.slice(0, 10) || '',
        education: {
          ...prev.education,
          university: freshUser.profile?.university || '',
          gpa: freshUser.profile?.gpa || '',
          major: freshUser.profile?.course || '',
        },
      }));
    };
    syncLatestProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('education.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, education: { ...prev.education, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentChange = (docName, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...(prev.documents || {}),
        [docName]: value,
      },
    }));
    setDocumentErrors((prev) => ({ ...prev, [docName]: '' }));
  };

  const handleUploadDocument = async (docName, file) => {
    if (!file) return;
    setError('');
    setDocumentErrors((prev) => ({ ...prev, [docName]: '' }));
    const fieldId = `doc-upload-${docName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setDocumentErrors((prev) => ({
        ...prev,
        [docName]: 'Invalid file type. Please upload only PDF, JPG, or PNG files.',
      }));
      document.getElementById(fieldId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setDocumentErrors((prev) => ({
        ...prev,
        [docName]: 'File is too large. Maximum upload size is 10MB per document.',
      }));
      document.getElementById(fieldId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setUploadingDocs((prev) => ({ ...prev, [docName]: true }));
    try {
      const payload = new FormData();
      payload.append('file', file);
      const res = await api.post('/api/applications/upload-document', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedFile = res.data?.file;
      handleDocumentChange(docName, {
        url: uploadedFile?.url || '',
        originalName: uploadedFile?.originalName || file.name,
        mimetype: uploadedFile?.mimetype || file.type,
      });
    } catch (err) {
      setDocumentErrors((prev) => ({
        ...prev,
        [docName]: err.response?.data?.message || `Failed to upload document: ${docName}`,
      }));
      document.getElementById(fieldId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docName]: false }));
    }
  };

  const normalizeDocName = (doc) => String(doc || '').trim();
  const isOptionalDocument = (doc) => /\boptional\b/i.test(String(doc || ''));
  const requiredDocuments = (scholarship?.documents || [])
    .filter((doc) => !isOptionalDocument(doc))
    .map(normalizeDocName);
  const optionalDocuments = (scholarship?.documents || [])
    .filter((doc) => isOptionalDocument(doc))
    .map(normalizeDocName);

  const wordCount = formData.applicationLetter.split(' ').filter(Boolean).length;
  const isPersonalComplete = Boolean(
    formData.phone?.trim() &&
    formData.dateOfBirth &&
    formData.address?.trim() &&
    formData.country?.trim()
  );
  const isEducationComplete = Boolean(
    formData.education.currentLevel &&
    formData.education.university?.trim() &&
    formData.education.major?.trim() &&
    formData.education.gpa !== ''
  );
  const isStatementComplete = Boolean(formData.applicationLetter.trim() && wordCount >= 50);
  const areRequiredDocumentsComplete = requiredDocuments.every((doc) =>
    Boolean(getDocumentUrl(formData.documents?.[doc]))
  );
  const isAnyUploadInProgress = Object.values(uploadingDocs).some(Boolean);
  const isFormComplete = isPersonalComplete && isEducationComplete && isStatementComplete && areRequiredDocumentsComplete && !isAnyUploadInProgress;

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
          documents: formData.documents || {},
        },
        applicationLetter: formData.applicationLetter,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/my-applications', { state: { applied: true } });
      }, 1500);
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
      {submitSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-8 max-w-md w-full text-center animate-fadeInUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl text-emerald-600 animate-pulse mb-4">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Application Submitted!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Redirecting you to My Applications...
            </p>
          </div>
        </div>
      )}
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
                  <ChronoSelect
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                    onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date ? date.toISOString().slice(0, 10) : '' }))}
                    placeholder="Select date of birth"
                    yearRange={[1950, new Date().getFullYear()]}
                  />
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
              <button
                type="button"
                onClick={() => {
                  if (!isPersonalComplete) {
                    setError('Please fill all personal details before continuing.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                disabled={!isPersonalComplete}
                className="btn-primary mt-6 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                  <select
                    name="education.major"
                    value={formData.education.major}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Select course/program</option>
                    {(
                      formData.education.major &&
                      !COURSE_OPTIONS.includes(formData.education.major)
                        ? [formData.education.major, ...COURSE_OPTIONS]
                        : COURSE_OPTIONS
                    ).map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary px-6 py-3">← Back</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEducationComplete) {
                      setError('Please complete all education details before continuing.');
                      return;
                    }
                    setError('');
                    setStep(3);
                  }}
                  disabled={!isEducationComplete}
                  className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Statement →
                </button>
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

              {(requiredDocuments.length > 0 || optionalDocuments.length > 0) && (
                <div className="mb-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3">📄 Required by this scholarship</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Upload each asked document. Required ones must be uploaded before submission.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Allowed types: PDF, JPG, PNG. Maximum size: 10MB per file.
                  </p>

                  {requiredDocuments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {requiredDocuments.map((doc) => (
                        <div key={doc}>
                          <label className="label">{doc} *</label>
                          <div className="space-y-2">
                            <input
                              id={`doc-upload-${doc.replace(/[^a-zA-Z0-9]/g, '-')}`}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleUploadDocument(doc, e.target.files?.[0])}
                              className="input"
                              required={!formData.documents?.[doc]}
                            />
                            {uploadingDocs[doc] && <p className="text-xs text-blue-600">Uploading...</p>}
                            {documentErrors[doc] && <p className="text-xs text-red-500">{documentErrors[doc]}</p>}
                            {formData.documents?.[doc] && (() => {
                              const meta = getDocumentMeta(formData.documents[doc]);
                              const isImage = meta?.mimetype.startsWith('image/');
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={meta?.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700"
                                      title={meta?.originalName}
                                    >
                                      📎 {meta?.originalName}
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDocumentChange(doc, '')}
                                      className="text-xs text-red-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  {isImage && (
                                    <img
                                      src={meta?.url}
                                      alt={meta?.originalName}
                                      className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                    />
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {optionalDocuments.length > 0 && (
                    <div className="space-y-3">
                      {optionalDocuments.map((doc) => (
                        <div key={doc}>
                          <label className="label">{doc}</label>
                          <div className="space-y-2">
                            <input
                              id={`doc-upload-${doc.replace(/[^a-zA-Z0-9]/g, '-')}`}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleUploadDocument(doc, e.target.files?.[0])}
                              className="input"
                            />
                            {uploadingDocs[doc] && <p className="text-xs text-blue-600">Uploading...</p>}
                            {documentErrors[doc] && <p className="text-xs text-red-500">{documentErrors[doc]}</p>}
                            {formData.documents?.[doc] && (() => {
                              const meta = getDocumentMeta(formData.documents[doc]);
                              const isImage = meta?.mimetype.startsWith('image/');
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={meta?.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700"
                                      title={meta?.originalName}
                                    >
                                      📎 {meta?.originalName}
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDocumentChange(doc, '')}
                                      className="text-xs text-red-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  {isImage && (
                                    <img
                                      src={meta?.url}
                                      alt={meta?.originalName}
                                      className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                    />
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                {wordCount} words (minimum 50)
              </p>
              {!areRequiredDocumentsComplete && requiredDocuments.length > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please provide all required scholarship documents before submitting.
                </p>
              )}
              {isAnyUploadInProgress && (
                <p className="text-xs text-blue-600 mt-1">
                  Please wait until all document uploads are complete.
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary px-6 py-3">← Back</button>
                <button
                  type="submit"
                  disabled={loading || !isFormComplete}
                  className="btn-primary px-8 py-3 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
