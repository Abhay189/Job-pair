import React, { useState } from 'react';
import '../Styles/CreateJobPage.css';

function CreateJobPage() {
  const [jobDetails, setJobDetails] = useState({
    jobTitle: '',
    jobLocation: '',
    salary: '',
    company: '',
    technicalSkills: '',
    deadline: '',
    jobDescription: '',
    questionsCount: '1'
  });

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

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Define the API endpoint
    const apiEndpoint = 'http://localhost:5000/create_job'; // Adjust the URL based on your actual endpoint
  
    // Prepare the data to be sent in the request
    const formData = new FormData();
    formData.append('job_title', jobDetails.jobTitle);
    formData.append('job_location', jobDetails.jobLocation);
    formData.append('salary', jobDetails.salary);
    formData.append('technical_skills', jobDetails.technicalSkills);
    formData.append('company', jobDetails.company);
    formData.append('deadline', jobDetails.deadline);
    formData.append('job_description', jobDetails.jobDescription);
    // Append other fields as necessary
  
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData // Sending the form data
      });
  
      const responseData = await response.json(); // Assuming the server responds with JSON
  
      if (response.ok) {
        console.log('Job created successfully:', responseData);
        // Handle success response (e.g., showing a success message or redirecting)
      } else {
        console.error('Failed to create job:', responseData);
        // Handle non-success responses (e.g., showing an error message)
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      // Handle network errors or other unexpected errors
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
  );
}

export default CreateJobPage;
