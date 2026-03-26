import React, { useState, useEffect } from 'react';
import api from '../api/api';

const AdminDashboard = () => {
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider: '',
    category: '',
    country: '',
    amount: '',
    currency: 'USD',
    deadline: '',
    educationLevel: 'Any',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scholarshipsRes, applicationsRes] = await Promise.all([
        api.get('/api/scholarships?limit=100'),
        api.get('/api/applications'),
      ]);
      setScholarships(scholarshipsRes.data.scholarships);
      setApplications(applicationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScholarship = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/scholarships', formData);
      setShowScholarshipForm(false);
      fetchData();
      setFormData({
        title: '',
        description: '',
        provider: '',
        category: '',
        country: '',
        amount: '',
        currency: 'USD',
        deadline: '',
        educationLevel: 'Any',
      });
    } catch (error) {
      console.error('Error creating scholarship:', error);
    }
  };

  const handleDeleteScholarship = async (id) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await api.delete(`/api/scholarships/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting scholarship:', error);
      }
    }
  };

  const handleUpdateApplicationStatus = async (id, status) => {
    try {
      await api.put(`/api/applications/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-blue-600">{scholarships.length}</h3>
          <p className="text-gray-600">Total Scholarships</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-green-600">{applications.length}</h3>
          <p className="text-gray-600">Total Applications</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-purple-600">
            {applications.filter(a => a.status === 'Pending').length}
          </h3>
          <p className="text-gray-600">Pending Applications</p>
        </div>
      </div>

      {/* Add Scholarship Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowScholarshipForm(!showScholarshipForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          {showScholarshipForm ? 'Cancel' : 'Add New Scholarship'}
        </button>
      </div>

      {/* Scholarship Form */}
      {showScholarshipForm && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create Scholarship</h2>
          <form onSubmit={handleSubmitScholarship} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="px-4 py-2 border rounded"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              <option value="Academic">Academic</option>
              <option value="Need-Based">Need-Based</option>
              <option value="Merit-Based">Merit-Based</option>
              <option value="International">International</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
            <input
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="px-4 py-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="px-4 py-2 border rounded"
              required
            />
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="px-4 py-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 border rounded md:col-span-2"
              rows="4"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
              Create Scholarship
            </button>
          </form>
        </div>
      )}

      {/* Applications */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Applications</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Scholarship</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Applied</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 10).map((application) => (
                <tr key={application._id} className="border-t">
                  <td className="px-6 py-4">{application.student?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{application.scholarship?.title || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      application.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(application.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={application.status}
                      onChange={(e) => handleUpdateApplicationStatus(application._id, e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scholarships */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Scholarships</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Deadline</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map((scholarship) => (
                <tr key={scholarship._id} className="border-t">
                  <td className="px-6 py-4">{scholarship.title}</td>
                  <td className="px-6 py-4">{scholarship.category}</td>
                  <td className="px-6 py-4">{scholarship.amount.toLocaleString()} {scholarship.currency}</td>
                  <td className="px-6 py-4">{new Date(scholarship.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteScholarship(scholarship._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

