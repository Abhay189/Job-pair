import React, { useState,useEffect } from 'react';
import '../Styles/CreateJobPage.css';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const SetupInfoPage = () => {
  const [industry, setIndustry] = useState('');
  const [gpa, setGpa] = useState('');
  const [graduated, setGraduated] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [lastCompany, setLastCompany] = useState('');
  const [aspirations, setAspirations] = useState('');
  const [strengths, setStrengths] = useState('');
  const [leadership, setLeadership] = useState('');
  const [error, setError] = useState(null);
  const [seekerId, setSeekerId] = useState('');

  let navigate = useNavigate();

  useEffect(() => {
    const temp_id = localStorage.getItem('id');
    setSeekerId(temp_id);
    console.log('current user id: ', temp_id);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('sent user id: ', seekerId);

    const formData = {
      seekerId, // Include the id here
      industry,
      gpa,
      graduated,
      universityName,
      lastCompany,
      aspirations,
      strengths,
      leadership,
    };

    console.log(formData)

    try {
      const response = await axios.put('http://127.0.0.1:5002/seeker-profile-setup', formData);
      console.log('Response:', response.data);

      // Navigate to '/viewJobs' upon successful submission
      navigate('/viewJobs');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="ce-job-form-container-upper">
      <h1>Profile Setup Information</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="ce-job-form-container">
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <div className="ce-job-form-twos">
            <label>Dropbox for your industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {/* Options for industries */}
              <option value="Tech">Tech</option>
              <option value="Law">Law</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Retail">Retail</option>
              <option value="Consulting">Consulting</option>
              <option value="Government">Government</option>
              <option value="Non-profit">Non-profit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* GPA */}
          <div className="ce-job-form-twos">
            <label>GPA</label>
            <input type="text" value={gpa} onChange={(e) => setGpa(e.target.value)} />
          </div>
          {/* Graduated */}
          <div className="ce-job-form-twos">
            <label>Did you graduate?</label>
            <select value={graduated} onChange={(e) => setGraduated(e.target.value)}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {/* University Name */}
          <div className="ce-job-form-twos">
            <label>Name of University</label>
            <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} />
          </div>
          {/* Last Company Worked At */}
          <div className="ce-job-form-twos">
            <label>Last Company Worked At</label>
            <input type="text" value={lastCompany} onChange={(e) => setLastCompany(e.target.value)} />
          </div>
          {/* Career Aspirations */}
          <div className="ce-job-form-twos">
            <label>What are your career aspirations?</label>
            <textarea value={aspirations} onChange={(e) => setAspirations(e.target.value)} />
          </div>
          {/* Achievements */}
          <div className="ce-job-form-twos">
            <label>What achievements are you most proud of?</label>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} />
          </div>
          {/* Leadership Experiences */}
          <div className="ce-job-form-twos">
            <label>Summarize your past leadership experiences</label>
            <textarea value={leadership} onChange={(e) => setLeadership(e.target.value)} />
          </div>
          {/* Submit Button */}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SetupInfoPage;
