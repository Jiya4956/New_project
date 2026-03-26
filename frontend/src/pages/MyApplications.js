import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/applications/my-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">You haven't applied for any scholarships yet</p>
          <Link to="/scholarships" className="text-blue-600 hover:underline">
            Browse Scholarships
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {application.scholarship.title}
                  </h3>
                  <p className="text-gray-600">{application.scholarship.provider}</p>
                </div>
                <span className={`px-4 py-2 rounded-full ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-semibold">Applied:</span>{' '}
                  {new Date(application.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Amount:</span>{' '}
                  {application.scholarship.amount.toLocaleString()} {application.scholarship.currency}
                </div>
                <div>
                  <span className="font-semibold">Deadline:</span>{' '}
                  {new Date(application.scholarship.deadline).toLocaleDateString()}
                </div>
              </div>

              {application.reviewNotes && (
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h4 className="font-semibold mb-2">Review Notes:</h4>
                  <p className="text-gray-700">{application.reviewNotes}</p>
                </div>
              )}

              <Link
                to={`/scholarships/${application.scholarship._id}`}
                className="text-blue-600 hover:underline"
              >
                View Scholarship Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;

