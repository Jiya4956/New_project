import React, { useState } from "react";
import axios from "axios";

const Feedback = () => {
  const [message, setMessage] = useState("");

  const submitFeedback = async () => {
    try {
      await axios.post("http://localhost:5000/api/feedback", {
        name: "Student",
        email: "student@test.com",
        message,
      });

      alert("Feedback Submitted ✅");
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Give Feedback</h2>

      <textarea
        placeholder="Write your feedback..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="5"
        style={{ width: "300px" }}
      />

      <br /><br />

      <button onClick={submitFeedback}>
        Submit Feedback
      </button>
    </div>
  );
};

export default Feedback;