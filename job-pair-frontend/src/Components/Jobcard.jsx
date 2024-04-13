import React from 'react';
import '../Styles/jobpage.css';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import axios from 'axios';

function JobCard({ job, userType,deleteJobFunction }) {

  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      const tempId = localStorage.getItem('id');
      if (tempId) {
          setUserId(tempId);
          console.log('current user id: ', tempId);
      }
  }, []);

  const sendToApplication = () => {
      if (userType === 'seekers' && userId && job) {
          const requestData = {
              id: userId,
              job_id: job.id,
              company: job.company,
              job_title: job.title
          };

          axios.post('http://127.0.0.1:5002/create_application', requestData)
              .then(response => {
                  console.log(response.data);
                  navigate('/applicationReview/' + job.id);
              })
              .catch(error => {
                  console.error(error);
                  // Handle error - redirect to an error page or show an error message
              });
      } else {
          console.error('Missing user ID, job data, or user type is not "seekers"');
      }
  }

  const closeJob = () => {
    deleteJobFunction(job.id)
  }

  const editJob = () => {
    navigate('/editJob/' + job.id)

  }

  const viewApplicants = () => {
    navigate('/applicants/' + job.id)
  }

  
   useEffect(() => {
    console.log(userType)
   }, [userType])

  return (
    <>
    
    <div className="job-card" onClick={sendToApplication }>
      <div className="job-card-body">  
        <div className='job-card-body-flex'>
        <div>
        <h3>{job.title}</h3>
        <p>{job.location}</p>
        <p>{job.company}</p>
        <p>{job.applicants} Applicants</p>
        <p>Posting date: {job.posting_date}</p>
        <p>Deadline: {job.deadline}</p>
        </div>
        <div>
        <img src={job.logo_url} alt="Company Logo" className="company-logo" />

        </div>
        </div>
        {userType === 'recruiters' || userType === 'admins' ? (
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as="button">
                  <Button size="lg" variant="primary" onClick={(e) => { e.stopPropagation(); closeJob(); }}>Close</Button>
                </Dropdown.Item>
                <Dropdown.Item as="button">
                  <Button size="lg" variant="primary" onClick={(e) => { e.stopPropagation(); editJob(); }}>Edit</Button>
                </Dropdown.Item>
                <Dropdown.Item as="button">
                  <Button size="lg" variant="primary" onClick={(e) => { e.stopPropagation(); viewApplicants(); }}>Applicants</Button>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : null}
      </div>
    </div>
    </>
  );
}

export default JobCard;
