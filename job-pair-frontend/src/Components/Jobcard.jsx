import React from 'react';
import '../Styles/jobpage.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
function JobCard({ job, userType }) {
  const navigate = useNavigate();
  
  const sendToApplication = () => {
    navigate('/')
  }

  const deleteJob = () => {

  }

  const editJob = (e) => {
    e.stopPropagation();
    navigate('/createjob');
  }
  return (
    <>
    
    <div onClick={sendToApplication} className="job-card">
      <div className="job-card-body">
        {(userType === 'recruiter' || userType === 'admin') &&
          <div className='job-card-buttons'>
            <Button size="lg" variant="primary" onClick={deleteJob} >
              Close
            </Button>
            <img src={job.logoUrl} alt="Company Logo" className="company-logo" />
            <Button size="lg" variant="primary" onClick={editJob}>
              Edit
            </Button>

          </div>
        }

        <h3>{job.title}</h3>
        <p>{job.location}</p>
        <p>{job.applicants} Applicants</p>
        <p>Posting date: {job.postingDate}</p>
      </div>
    </div>
    </>
  );
}

export default JobCard;
