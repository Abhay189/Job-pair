import React from 'react';
import '../Styles/jobpage.css';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { Button } from 'react-bootstrap';
function JobCard({ job, userType,deleteJobFunction }) {
  const navigate = useNavigate();
  
  const sendToApplication = () => {
    navigate('/')
  }

  const closeJob = () => {
    deleteJobFunction(job.id)
  }

  const editJob = () => {
    navigate('/editJob/' + job.id)

  }

  // use effect print user type every time it changes 
   useEffect(() => {
    console.log(userType)
   }, [userType])

  return (
    <>
    
    <div onClick={sendToApplication} className="job-card">
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

          </div>
        }

        {
          (userType === 'seekers') &&
          <img src={job.logoUrl} alt="Company Logo" className="company-logo" />
        }

        <h3>{job.title}</h3>
        <p>{job.location}</p>
        <p>{job.companyName}</p>
        <p>{job.applicants} Applicants</p>
        <p>Posting date: {job.postingDate}</p>
      </div>
    </div>
    </>
  );
}

export default JobCard;
