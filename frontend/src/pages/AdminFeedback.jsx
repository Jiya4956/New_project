import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/feedback"
      );
      setFeedbacks(res.data);
    } catch (error) {
      console.log("Error loading feedback:", error);
    }
  };

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">
        Admin Feedback Panel
      </h1>

      {feedbacks.length === 0 ? (
        <p>No feedback available</p>
      ) : (
        feedbacks.map((fb) => (
          <div
            key={fb._id}
            className="border p-4 mb-4 rounded shadow"
          >
            <p><b>Name:</b> {fb.name}</p>
            <p><b>Email:</b> {fb.email}</p>
            <p><b>Message:</b> {fb.message}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminFeedback;