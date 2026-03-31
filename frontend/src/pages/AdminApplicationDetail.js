import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

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

const isImageDocument = (meta) => meta?.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(meta?.url || '');
const isPdfDocument = (meta) => meta?.mimetype === 'application/pdf' || /\.pdf$/i.test(meta?.url || '');

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDraft, setStatusDraft] = useState('Pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/api/applications/${id}`);
        setApplication(res.data);
        setStatusDraft(res.data.status || 'Pending');
        setReviewNotes(res.data.reviewNotes || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="card p-8 max-w-xl text-center">
          <p className="text-red-600 font-semibold mb-3">Could not load application</p>
          <p className="text-slate-500 mb-4">{error || 'Application not found'}</p>
          <button onClick={() => navigate('/admin')} className="btn-primary">Back to admin</button>
        </div>
      </div>
    );
  }

  const docEntries = Object.entries(application.personalInfo?.documents || {})
    .map(([label, entry]) => ({ label, meta: getDocumentMeta(entry) }))
    .filter((item) => item.meta?.url);

  const handleStatusSave = async () => {
    try {
      setSavingStatus(true);
      const res = await api.put(`/api/applications/${id}/status`, {
        status: statusDraft,
        reviewNotes,
      });
      setApplication((prev) => ({ ...prev, ...res.data, status: statusDraft, reviewNotes }));
      setToast('Application status updated');
      setTimeout(() => setToast(''), 1800);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setToast(''), 2200);
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && (
        <div className="toast toast-info">
          {toast}
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Application Details</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Review student submission and uploaded documents</p>
          </div>
          <Link to="/admin" className="btn-secondary">Back to Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Student & Scholarship</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Student</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{application.student?.name || '-'}</p>
                  <p className="text-slate-500">{application.student?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Scholarship</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{application.scholarship?.title || '-'}</p>
                  <p className="text-slate-500">{application.scholarship?.provider || '-'}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Application Statement</h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {application.applicationLetter || 'No application statement submitted.'}
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Uploaded Documents</h2>
              {docEntries.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded.</p>
              ) : (
                <div className="space-y-4">
                  {docEntries.map(({ label, meta }) => (
                    <div key={`${label}-${meta.url}`} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400">{label}</p>
                          <a href={meta.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                            {meta.originalName}
                          </a>
                        </div>
                        <a href={meta.url} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3">
                          Open
                        </a>
                      </div>
                      {isImageDocument(meta) && (
                        <img src={meta.url} alt={meta.originalName} className="mt-3 h-28 w-28 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                      )}
                      {isPdfDocument(meta) && (
                        <iframe title={meta.originalName} src={meta.url} className="mt-3 w-full h-56 rounded-lg border border-slate-200 dark:border-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Application Meta</h2>
              <p className="text-xs text-slate-400">Status</p>
              <div className="space-y-3 mb-3">
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  className="input text-sm"
                >
                  {['Pending', 'Reviewed', 'Accepted', 'Rejected'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="input text-sm"
                  rows={3}
                  placeholder="Add review notes (optional)"
                />
                <button
                  type="button"
                  onClick={handleStatusSave}
                  disabled={savingStatus}
                  className="btn-primary w-full text-sm py-2.5 disabled:opacity-50"
                >
                  {savingStatus ? 'Saving...' : 'Update Status'}
                </button>
              </div>
              <p className="text-xs text-slate-400">Applied on</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {new Date(application.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Personal Info</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-400">Phone:</span> {application.personalInfo?.phone || '-'}</p>
                <p><span className="text-slate-400">Country:</span> {application.personalInfo?.country || '-'}</p>
                <p><span className="text-slate-400">Address:</span> {application.personalInfo?.address || '-'}</p>
                <p><span className="text-slate-400">DOB:</span> {application.personalInfo?.dateOfBirth || '-'}</p>
                <p><span className="text-slate-400">Education:</span> {application.personalInfo?.education?.currentLevel || '-'}</p>
                <p><span className="text-slate-400">University:</span> {application.personalInfo?.education?.university || '-'}</p>
                <p><span className="text-slate-400">Major:</span> {application.personalInfo?.education?.major || '-'}</p>
                <p><span className="text-slate-400">GPA:</span> {application.personalInfo?.education?.gpa || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetail;
