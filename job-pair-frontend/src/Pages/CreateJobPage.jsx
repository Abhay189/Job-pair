import React, { useState } from 'react';
import './CreateJobPage.css';

function CreateJobPage() {
  const [jobDetails, setJobDetails] = useState({
    jobTitle: '',
    jobLocation: '',
    salary: '',
    company: '',
    technicalSkills: '',
    deadline: '',
    jobDescription: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', jobDetails);
  };

  return (
    <div className="ce-job-form-container-upper">
      <h1>Create/Edit Job</h1>
    <div className="ce-job-form-container">
      
      <form onSubmit={handleSubmit}>

        <div className='ce-job-form-twos'>
          <label> Job Title
            <input type="text" name="jobTitle" value={jobDetails.jobTitle} placeholder="Software Developer" onChange={handleChange} />
          </label>
          
          <label> Job Location
            <input type="text" name="jobLocation" value={jobDetails.jobLocation} placeholder="Vancouver, BC" onChange={handleChange} />
          </label>
        </div>

        <div className='ce-job-form-twos'>
          <label> Salary
            <input type="text" name="salary" value={jobDetails.salary} placeholder="C$192,000" onChange={handleChange} />
          </label>

          <label> Technical Skills
            <input type="text" name="technicalSkills" value={jobDetails.technicalSkills} placeholder="Java, Python, CSS ..." onChange={handleChange} />
          </label>
        </div>

        <div className='ce-job-form-twos'>
          <label> Company
            <input type="text" name="company" value={jobDetails.company} placeholder="Amazon Ltd." onChange={handleChange} />
          </label>

          <label> Deadline
            <input type="date" name="deadline" value={jobDetails.deadline} onChange={handleChange} />
          </label>
        </div>

        <label className='jobdesc'> Job Description
          <textarea name="jobDescription" value={jobDetails.jobDescription} onChange={handleChange} />
        </label>

        <button type="submit">Submit</button>
      </form>
    </div>
    </div>
  );
}

export default CreateJobPage;
