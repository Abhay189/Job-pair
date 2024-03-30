import React, { useState,useEffect } from 'react';
import '../Styles/CreateJobPage.css';
import { useParams } from 'react-router-dom';
import Axios from "axios";

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
  const { id } = useParams();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await Axios.post('http://127.0.0.1:5000/get-job', { id: id});
        const responseObject = response.data;
        setJobDetails( {
          jobTitle: responseObject.job_title,
          jobLocation: responseObject.job_location,
          salary: responseObject.salary,
          company: responseObject.company,
          technicalSkills: responseObject.technical_skills,
          deadline: responseObject.deadline,
          jobDescription: responseObject.job_description
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchJob();
  }, [id]);




  const handleSubmit = async (event) => {
    event.preventDefault();
    try{
    const formObj = {
      
      job_title: jobDetails.jobTitle,
    job_location: jobDetails.jobLocation,
    salary: jobDetails.salary,
    company: jobDetails.company,
    technical_skills: jobDetails.technicalSkills,
    deadline: jobDetails.deadline,
    job_description: jobDetails.jobDescription}
    if(id) {
      const response = await Axios.put('http://127.0.0.1:5000/update-job', {
        
    ...formObj
        
      
      
      , id: id }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        

      });
    } else {
      const response = await Axios.put('http://127.0.0.1:5000/create-job', ...formObj,  {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        

      });
    }}
    catch (error) {
      console.error(error);
    }
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
