import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

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
  'B.Sc Computer Science',
  'B.Sc Mathematics',
  'B.Sc Physics',
  'B.Sc Chemistry',
  'B.Sc Biotechnology',
  'B.Sc Agriculture',
  'B.Com',
  'B.Com (Hons)',
  'BA',
  'BA (Hons)',
  'BBA',
  'BMS',
  'BCA',
  'BCA (Data Analytics)',
  'BJMC',
  'BMM',
  'BSW',
  'LLB',
  'BA LLB',
  'BBA LLB',
  'B.Com LLB',
  'BFA',
  'B.Des',
  'BHM',
  'BTTM',
  'B.Ed',
  'B.El.Ed',
  'Bachelor of Social Work',
  'Bachelor of Performing Arts',
  'CA Foundation',
  'CS Executive',
  'CMA Foundation',
  'M.Tech',
  'ME',
  'MCA',
  'MBA',
  'PGDM',
  'M.Com',
  'MA',
  'M.Sc',
  'M.Sc Data Science',
  'M.Sc Biotechnology',
  'M.Arch',
  'M.Plan',
  'LLM',
  'MS',
  'MD',
  'MS (Medical)',
  'MDS',
  'M.Pharm',
  'M.Ed',
  'MPH',
  'PhD',
  'Postdoctoral',
  'Certificate Course',
  'Vocational Course',
  'Other',
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    country: '',
    dateOfBirth: '',
    marks: '',
    income: '',
    category: '',
    course: '',
    university: '',
    gpa: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        country: user.profile?.country || '',
        dateOfBirth: user.profile?.dateOfBirth?.slice(0, 10) || '',
        marks: user.profile?.marks || '',
        income: user.profile?.income || '',
        category: user.profile?.category || '',
        course: user.profile?.course || '',
        university: user.profile?.university || '',
        gpa: user.profile?.gpa || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/api/auth/profile', {
        name: formData.name,
        profile: {
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          dateOfBirth: formData.dateOfBirth,
          marks: formData.marks,
          income: formData.income,
          category: formData.category,
          course: formData.course,
          university: formData.university,
          gpa: formData.gpa,
        },
      });
      updateUser(res.data);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const completionFields = ['name', 'phone', 'country', 'course', 'gpa', 'income', 'category'];
  const filled = completionFields.filter(f => !!formData[f]).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  const tabs = [
    { id: 'personal', icon: '👤', label: 'Personal', desc: 'Basic details' },
    { id: 'academic', icon: '🎓', label: 'Academic', desc: 'Education info' },
    { id: 'financial', icon: '💰', label: 'Financial', desc: 'Income details' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-2 border-white/30 group-hover:scale-105 transition-transform duration-300">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-3 border-white flex items-center justify-center shadow-lg"
                style={{ borderWidth: '3px' }}>
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <p className="text-blue-200 text-sm font-medium mb-1">{getGreeting()} 👋</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{user?.name || 'Student'}</h1>
              <p className="text-blue-200/80 text-sm flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {user?.email}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white uppercase tracking-wide">
                  {user?.role}
                </span>
              </p>
            </div>

            {/* Completion Ring */}
            <div className="hidden sm:flex flex-col items-center gap-2">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="url(#completionGrad)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${completion * 2.64} ${264 - completion * 2.64}`}
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                  <defs>
                    <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{completion}%</span>
                </div>
              </div>
              <p className="text-xs text-blue-200 font-medium">Profile Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content — overlaps hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12 relative z-10">

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-1.5 flex gap-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Completion Bar — mobile only */}
        <div className="sm:hidden mb-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Profile Completion</span>
            <span className="text-sm font-bold text-blue-600">{completion}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completion}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
              }}
            />
          </div>
          {completion < 100 && (
            <p className="text-xs text-slate-400 mt-2">
              Fill {completionFields.length - filled} more field{completionFields.length - filled !== 1 ? 's' : ''} for better recommendations
            </p>
          )}
        </div>

        {/* Toast Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fadeInUp ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
          }`}>
            <span className="text-lg">{message.type === 'success' ? '✅' : '❌'}</span>
            {message.text}
          </div>
        )}

        {/* Form Cards */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'personal' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden animate-fadeIn">
              <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-lg">👤</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                    <p className="text-sm text-slate-400">Your basic details and contact info</p>
                  </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <input value={user?.email || ''} disabled
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-500 cursor-not-allowed text-sm pr-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="+91 99999 99999" type="tel" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                    <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      type="date" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Country</label>
                    <input name="country" value={formData.country} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="India" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Address</label>
                    <input name="address" value={formData.address} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="123 Main St, City" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden animate-fadeIn">
              <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-lg">🎓</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic Information</h2>
                    <p className="text-sm text-slate-400">Your education details for scholarship matching</p>
                  </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 mb-6">
                  <span className="text-xl mt-0.5">💡</span>
                  <p className="text-sm text-blue-700 dark:text-blue-300">This information is used by our AI to match you with the most relevant scholarship recommendations.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Course / Program</label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select course/program</option>
                      {COURSE_OPTIONS.map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">University / College</label>
                    <input name="university" value={formData.university} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="IIT Delhi" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">GPA / Percentage</label>
                    <input name="gpa" value={formData.gpa} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="8.5 or 85%" type="number" step="0.1" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">12th / Last Exam Marks (%)</label>
                    <input name="marks" value={formData.marks} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm"
                      placeholder="92" type="number" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden animate-fadeIn">
              <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-lg">💰</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Financial Information</h2>
                    <p className="text-sm text-slate-400">Used for need-based scholarship matching</p>
                  </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30 mb-6">
                  <span className="text-xl mt-0.5">🔒</span>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Your financial information is completely private and only used for scholarship matching algorithms.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Annual Family Income (₹)</label>
                    <select name="income" value={formData.income} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm appearance-none cursor-pointer">
                      <option value="">Select income range</option>
                      <option value="below-1L">Below ₹1 Lakh</option>
                      <option value="1L-2.5L">₹1 Lakh – ₹2.5 Lakh</option>
                      <option value="2.5L-5L">₹2.5 Lakh – ₹5 Lakh</option>
                      <option value="5L-8L">₹5 Lakh – ₹8 Lakh</option>
                      <option value="8L-12L">₹8 Lakh – ₹12 Lakh</option>
                      <option value="above-12L">Above ₹12 Lakh</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Scholarship Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-sm appearance-none cursor-pointer">
                      <option value="">Select preferred category</option>
                      <option value="Merit-Based">🏆 Merit-Based</option>
                      <option value="Need-Based">🤝 Need-Based</option>
                      <option value="Government">🏛️ Government</option>
                      <option value="Private">🏢 Private</option>
                      <option value="International">🌍 International</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {completion < 100 && (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Complete your profile for better scholarship matches</span>
                </>
              )}
              {completion === 100 && (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-500">Profile complete — you're getting the best recommendations!</span>
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              id="save-profile-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
