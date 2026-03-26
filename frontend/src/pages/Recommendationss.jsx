import React, { useState } from "react";
import axios from "axios";

const Recommendations = () => {
  const [profile, setProfile] = useState({
    course: "",
    marks: "",
    income: "",
    category: ""
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const getRecommendations = async () => {
    try {
      setLoading(true);

      console.log("Sending profile:", profile);

      const res = await axios.post(
        "http://localhost:5000/api/recommendations/recommend",
        profile
      );

      console.log("Response:", res.data);

      setResults(res.data);

    } catch (error) {
      console.error("Recommendation error:", error);
      alert("Error fetching recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">
        AI Scholarship Recommendation
      </h2>

      <input
        name="course"
        placeholder="Course"
        onChange={handleChange}
        className="border p-2 m-2"
      />

      <input
        name="marks"
        placeholder="Marks"
        onChange={handleChange}
        className="border p-2 m-2"
      />

      <input
        name="income"
        placeholder="Family Income"
        onChange={handleChange}
        className="border p-2 m-2"
      />

      <input
        name="category"
        placeholder="Category"
        onChange={handleChange}
        className="border p-2 m-2"
      />

      <br />

      <button
        onClick={getRecommendations}
        className="bg-blue-600 text-white px-4 py-2 mt-4"
      >
        Get Recommendations
      </button>

      {loading && <p className="mt-4">Loading recommendations...</p>}

      <div className="mt-6">
        {results.length === 0 && !loading && (
          <p>No recommendations found</p>
        )}

        {results.map((sch) => (
          <div key={sch._id} className="border p-4 mt-2">
            <h3 className="font-bold">{sch.title}</h3>
            <p>{sch.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;