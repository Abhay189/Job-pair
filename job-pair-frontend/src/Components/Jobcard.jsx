import React from 'react';
import '../Styles/jobpage.css';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { Button } from 'react-bootstrap';
function JobCard({ job, userType,deleteJobFunction }) {
  const navigate = useNavigate();
  
  const sendToApplication = () => {
    if(userType === 'seekers'){
    navigate('/applicationReview/' + job.id)
    }
  }

  const closeJob = () => {
    deleteJobFunction(job.id)
  }

  const editJob = () => {
    debugger;
    navigate('/editJob/' + job.id)

  }

  const viewApplicants = () => {
    navigate('/applicants/' + job.id)
  }

  // use effect print user type every time it changes 
   useEffect(() => {
    console.log(userType)
   }, [userType])

  return (
    <>
    
    <div className="job-card" onClick={sendToApplication }>
      <div className="job-card-body">
        {(userType === 'recruiters' || userType === 'admins') &&
          <div className='job-card-buttons'>
            <Button size="lg" variant="primary" onClick={closeJob} >
              Close
            </Button>
            <img src={job.logoUrl} alt="Company Logo" className="company-logo" />
            <Button size="lg" variant="primary" onClick={editJob}>
              Edit
            </Button>
            <Button size="lg" variant="primary" onClick={viewApplicants}>
              Applicants
            </Button>

          </div>
        }

        {
          (userType === 'seekers') &&
          <img src={job.logoUrl} alt="Company Logo" className="company-logo" />
        }

        <h3>{job.job_title}</h3>
        <p>{job.job_location}</p>
        <p>{job.company}</p>
        <p>{job.applicants} Applicants</p>
        <p>Posting date: {job.posting_date}</p>
      </div>
    </div>
    </>
  );
}

export default JobCard;
