import React, { useState,useEffect } from 'react';
import '../Styles/CreateJobPage.css';
import { useParams,useNavigate } from 'react-router-dom';
import Axios from "axios";
import { Alert } from 'react-bootstrap';

function CreateJobPage() {

  let navigate = useNavigate();

  useEffect(()=> {
    const temp_id = localStorage.getItem('id');

    if (temp_id == null) {
        console.error('User not signed in, redirecting to login..');
        navigate('/');
    }
  },[]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    jobTitle: '',
    jobLocation: '',
    salary: '',
    company: '',
    technicalSkills: '',
    deadline: '',
    jobDescription: '',
    questionsCount: '1',
    questions: ['']
  });
  // debugger;
  const { id } = useParams();
  console.log("id is",id);

  const [additionalQuestions, setAdditionalQuestions] = useState(['']);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "questionsCount") {
      const newQuestionsCount = parseInt(value);
      const newAdditionalQuestions = Array(newQuestionsCount).fill('');
      setAdditionalQuestions(newAdditionalQuestions);
      setJobDetails({ ...jobDetails, [name]: value });
    } else {
      setJobDetails({ ...jobDetails, [name]: value });
    }
  };

  const handleQuestionChange = (value, index) => {
    const updatedQuestions = [...additionalQuestions];
    updatedQuestions[index] = value;
    setAdditionalQuestions(updatedQuestions);
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) {
          return;
        }
        const response = await Axios.post('http://127.0.0.1:5002/get-job', { id: id});
        const responseObject = response.data;
        setJobDetails( {
          jobTitle: responseObject.title,
          jobLocation: responseObject.location,
          salary: responseObject.salary,
          company: responseObject.company,
          technicalSkills: responseObject.technical_skills,
          deadline: responseObject.deadline,
          jobDescription: responseObject.Description,
          questionsCount: responseObject.Questions.length,

        });
        setAdditionalQuestions(responseObject.Questions);
      } catch (error) {
        console.error(error);
        setError(true);
      }
    };
    fetchJob();
  }, [id]);




  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess(false);
    setError(false);
    try{
    const formObj = {
      
      title: jobDetails.jobTitle,
    location: jobDetails.jobLocation,
    salary: jobDetails.salary,
    company: jobDetails.company,
    technical_skills: jobDetails.technicalSkills,
    deadline: jobDetails.deadline,
    description: jobDetails.jobDescription,
    recruiter_id: localStorage.getItem('id'),
    questions: additionalQuestions.map((question, index) => question ),
    questions_count: jobDetails.questionsCount,
  
  }
    if(id) {
      const response = await Axios.put('http://127.0.0.1:5002/update-job', {
        
    ...formObj
        
      
      
      , id: id }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        

      });
      setSuccess(true);
      const responseObject = response.data;
      setJobDetails({
        jobTitle: responseObject.title,
          jobLocation: responseObject.location,
          salary: responseObject.salary,
          company: responseObject.company,
          technicalSkills: responseObject.technical_skills,
          deadline: responseObject.deadline,
          jobDescription: responseObject.Description,
          questionsCount: responseObject.Questions.length,
      });
      setAdditionalQuestions(['']);
    } else {
      const response = await Axios.post('http://127.0.0.1:5002/create_job', {...formObj},  {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        

      });
      setSuccess(true);
      setJobDetails({
        jobTitle: '',
        jobLocation: '',
        salary: '',
        company: '',
        technicalSkills: '',
        deadline: '',
        jobDescription: ''
      });
    }}
    catch (error) {
      console.error(error);
      setSuccess(false);
      setError(true);
    }
  };

  return (
    <>
    
    <div className="ce-job-form-container-upper">
      <h1>Create/Edit Job</h1>
    <div className="ce-job-form-container">
    {success && <Alert variant="success">Create/Edit successful!</Alert>}
    {error && <Alert variant="danger">An error occurred!</Alert>}
      
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

        {/* Field for selecting the number of questions */}
        <label>How many questions do you want to ask?
            <select name="questionsCount" value={jobDetails.questionsCount} onChange={handleChange}>
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>

          {/* Dynamically generated question fields */}
          {additionalQuestions.map((question, index) => (
            <input
              key={index}
              type="text"
              name={`question${index + 1}`}
              value={question}
              placeholder={`Question ${index + 1}`}
              onChange={(e) => handleQuestionChange(e.target.value, index)}
            />
          ))}

        <button type="submit">Submit</button>
      </form>
    </div>
    </div>
   
    </>
  );
}

export default CreateJobPage;
