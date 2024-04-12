import React, { useState } from 'react';
import '../Styles/CreateJobPage.css'; // Import the same CSS file
import { Alert } from 'react-bootstrap';

const SetupInfoPage = () => {
  const [industry, setIndustry] = useState('');
  const [gpa, setGpa] = useState('');
  const [graduated, setGraduated] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [lastCompany, setLastCompany] = useState('');
  const [aspirations, setAspirations] = useState('');
  const [strengths, setStrengths] = useState('');
  const [leadership, setLeadership] = useState('');

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement logic to handle form submission (e.g., send data to backend)
  };

  return (
    <div className="ce-job-form-container-upper"> {/* Use the same container class */}
      <h1>Profile Setup Information</h1>
      <div className="ce-job-form-container"> {/* Use the same form container class */}
        <form onSubmit={handleSubmit}>
          <div className="ce-job-form-twos"> {/* Use the same form group class */}
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
          <div className="ce-job-form-twos">
            <label>GPA</label>
            <input type="text" value={gpa} onChange={(e) => setGpa(e.target.value)} />
          </div>
          <div className="ce-job-form-twos">
            <label>Did you graduate?</label>
            <select value={graduated} onChange={(e) => setGraduated(e.target.value)}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="ce-job-form-twos">
            <label>Name of University</label>
            <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} />
          </div>
          <div className="ce-job-form-twos">
            <label>Last Company Worked At</label>
            <input type="text" value={lastCompany} onChange={(e) => setLastCompany(e.target.value)} />
          </div>
          <div className="ce-job-form-twos">
            <label>What are your career aspirations?</label>
            <textarea value={aspirations} onChange={(e) => setAspirations(e.target.value)} />
          </div>
          <div className="ce-job-form-twos">
            <label>What achievements are you most proud of?</label>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} />
          </div>
          <div className="ce-job-form-twos">
            <label>Summarize your past leadership experiences</label>
            <textarea value={leadership} onChange={(e) => setLeadership(e.target.value)} />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SetupInfoPage;
