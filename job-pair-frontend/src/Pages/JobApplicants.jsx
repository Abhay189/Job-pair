import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApplicantCard from '../Components/ApplicantCard.jsx';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function JobApplicants() {

  const { id } = useParams();
  let navigate = useNavigate();

  useEffect(()=> {
    const temp_id = localStorage.getItem('id');

    if (temp_id == null) {
        console.error('User not signed in, redirecting to login..');
        navigate('/');
    }
  },[]);


  const [job, setJob] = useState({
    id: 1,
    logoUrl: 'https://banner2.cleanpng.com/20180324/sww/kisspng-google-logo-g-suite-chrome-5ab6e618b3b2c3.5810634915219358967361.jpg', // Replace with actual path to logo image
    title: 'Entry Level - Software Developer',
    location: 'Calgary, Alberta / Remote',
    applicants: 129,
    postingDate: '2024-01-10',
    applicantsList: []

  });

  const [applicants,setApplicants] = useState([])

  useEffect(() => {
    // Define the function to fetch job applicants
    const fetchJobApplicants = async () => {
        try {
           
            const response = await axios.get(`http://127.0.0.1:5002/get_my_job_applicants?job_id=3`);
            setApplicants(response.data)
        } catch (error) {
       
        }
    };

    // Call the function to fetch job applicants
    fetchJobApplicants();
}, [id]); // Empty dependency array to only execute once on mount

  return (
    <div>
        <div className='applicant-header-div'> <img src={job.logoUrl} alt="jobimage"></img> <h1>Applicants for {job.title}</h1> </div>
        <div>
         
            <ul>
                {applicants.map((applicant) => {
                    return (
                        <ApplicantCard applicant={applicant} key={applicant.id} />
                    )
                })}
            </ul>
            </div>




    </div>
  )
}

export default JobApplicants