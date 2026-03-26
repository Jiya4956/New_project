import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      const response = await api.get(`/api/scholarships/${id}`);
      setScholarship(response.data);
    } catch (error) {
      console.error('Error fetching scholarship:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl">Scholarship not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {scholarship.category}
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">{scholarship.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{scholarship.provider}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Amount</h3>
            <p className="text-2xl font-bold text-green-600">
              {scholarship.amount.toLocaleString()} {scholarship.currency}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Deadline</h3>
            <p className="text-xl">{new Date(scholarship.deadline).toLocaleDateString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Country</h3>
            <p className="text-xl">{scholarship.country}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Education Level</h3>
            <p className="text-xl">{scholarship.eligibility.educationLevel}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-600">{scholarship.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Eligibility</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            {scholarship.eligibility.requirements && scholarship.eligibility.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
            {scholarship.eligibility.gpaMin && (
              <li>Minimum GPA: {scholarship.eligibility.gpaMin}</li>
            )}
            {scholarship.eligibility.ageMin && scholarship.eligibility.ageMax && (
              <li>Age range: {scholarship.eligibility.ageMin} - {scholarship.eligibility.ageMax} years</li>
            )}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Application Process</h2>
          <p className="text-gray-600">{scholarship.applicationProcess}</p>
        </div>

        {scholarship.documents && scholarship.documents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Required Documents</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {scholarship.documents.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-4 mt-8">
          {user ? (
            <Link
              to={`/apply/${id}`}
              className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700"
            >
              Apply Now
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700"
            >
              Login to Apply
            </Link>
          )}
          <button
            onClick={() => navigate('/scholarships')}
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded hover:bg-gray-300"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;

