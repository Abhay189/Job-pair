import { useEffect, useState } from "react";
import Axios from 'axios';
import '../Styles/ApplicationReview.css'
import chatgpt from '../Assets/chatgpt.png'

import {
  Container,
} from "react-bootstrap";
import { useParams } from 'react-router-dom';

export default function ApplicationReview() {

  const { id } = useParams();  

  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedText, setEditedText] = useState("");

  const redirectToJobs = () => {
    window.location.reload();
    window.location.href = "http://localhost:3000/viewJobs";
};


  useEffect(() => {

    const user_id = localStorage.getItem('id');

    const jobUrl = `http://127.0.0.1:5002/get_all_jobs?id=${id}&userType=seekers`;
  
    Axios.get(jobUrl, {})
      .then((res) => {
        const jsonData = res.data;
  
        if (jsonData.length > 0) {
          const jobData = jsonData.find(item => item.id === Number(id));
          if (jobData) {
            setJobDescription(jobData.Description);
            setJobName(jobData.title);
            setQuestions(jobData.Questions);
  
            // Fetch responses for the job using another endpoint
            const answersUrl = `http://127.0.0.1:5002/get_job_answer?job_id=${id}&user_id=${user_id}`;  // Include user ID as needed
            return Axios.get(answersUrl);  // Return the promise for chaining
          } else {
            console.error(`Job with id ${id} not found in jsonData`);
          }
        }
      })
      .then((response) => {
        if (response && response.data) {
          setResponses(response.data.answers);
        }
      })
      .catch((error) => {
        console.error("Error fetching job responses:", error);
      });
  }, [id]);  


  const handleEditClick = (index) => {
    if (responses && index < responses.length) {
      setEditingIndex(index);
      setEditedText(responses[index]);
    } else {
      console.error('Invalid index or empty responses');
    }
  };
  
  const handleSaveClick = async (index) => {
    const updatedResponses = [...responses];
    updatedResponses[index] = editedText;
    setResponses(updatedResponses);

    setEditingIndex(-1);
    setEditedText("");

    try {
      await Axios.post("http://127.0.0.1:5002/update_job_answer", {
        user_id: 1,
        job_id: 11,
        index: index,
        updated_answer: editedText,
      });

      console.log("Post request successful");
    } catch (error) {
      console.error("Error sending post request:", error);
    }
  };

  const handleInputChange = (event) => {
    setEditedText(event.target.value);
  };

  const handleEnhanceClick = async (index) => {
    try {
        const enhancedResponse = await Axios.post("http://127.0.0.1:5002/get_enhanced_essay", {
            question: questions[index],
            answer: responses[index],
        });

        if (enhancedResponse && enhancedResponse.data && enhancedResponse.data.response) {
            const updatedResponses = [...responses];
            updatedResponses[index] = enhancedResponse.data.response;
            setResponses(updatedResponses);

            await Axios.post("http://127.0.0.1:5002/update_job_answer", {
                user_id: 1,  
                job_id: 11, 
                index: index,
                updated_answer: enhancedResponse.data.response,
            });

            console.log("Post request successful, response updated on server.");
        } else {
            console.error("Failed to receive enhanced essay response.");
        }
    } catch (error) {
        console.error("Error during enhancement or update process:", error);
    }
};


  const handleSubmitClick = async () => {
    try {
      const userId = localStorage.getItem('id');
      await Axios.post("http://127.0.0.1:5002/submit_application", {
        id:userId,
        job_id: id,
        job_title: jobName,
        application_response: responses,

      });
      
      redirectToJobs()
      console.log("Submit responses successful");
    } catch (error) {
      console.error("Error submitting responses:", error);
    }
  };

  return (
    <div className="container">
      <div style={{ minHeight: `77vh`, textAlign: `left` }}>
        <div className="cardd">
          <div style={{ fontWeight: 'bold', fontSize: '30px', textAlign: 'center', marginBottom: '20px', paddingTop: `20px` }}>{jobName}</div>
          <p style={{ fontSize: '20px', textAlign: 'center', marginBottom: '20px' }}>{jobDescription}</p>
          <Container className="outer-container">
          <div className="questiondiv">
            {questions.map((questionItem, index) => (
              <div key={index} className="question-container">
                <div style={{ width: "100%", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', margin: `10px 0`, border:'solid', borderWidth:'2px', borderColor:'#f0f0f0', borderRadius: '10px', padding: '10px', position: 'relative' }}>
                    <strong style={{ fontSize: '20px', textAlign: 'center', marginBottom: '15px' }}>Question:</strong> {questions[index]}
                </div>
                <div style={{ width: "100%", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', background: '#f0f0f0', margin: `10px 0`, border:'solid', borderWidth:'2px', borderColor:'#f0f0f0', borderRadius: '10px', padding: '10px', position: 'relative' }}>
                <label htmlFor={`textInput-${index}`} style={{ fontSize: '20px', fontWeight:'bold', textAlign: 'center'}} >Answer:</label>
                    {editingIndex === index ? (
                      <div >
                        <textarea 
                          id={`textInput-${index}`}
                          name={`textInput-${index}`}
                          value={editedText}
                          onChange={handleInputChange}
                          rows={4}
                          style={{ width: '100%', background: '#f0f0f0', padding: '10px', boxSizing: 'border-box' }}
                        />
                        <button className="saveButton" style={{ marginRight: '10px', fontWeight:'bold', color:'black'  }} onClick={() => handleSaveClick(index)}>Save</button>
                      </div>
                    ) : (
                      <div>
                        <div className="answer-container">
                          <p style={{ whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{responses[index]}</p>
                        </div>
                        <div className="buttonContainer">
                          <button className="editButton" style={{ marginRight: '10px', fontWeight: 'bold', color: 'white', backgroundColor: '#575DFB', borderRadius: '10px', border: 'none' }} onClick={() => handleEditClick(index)}>Edit</button>
                          <button className="enhanceButton" style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#575DFB', borderRadius: '10px', border: 'none' }} onClick={() => handleEnhanceClick(index)}>
                            <img src={chatgpt} alt="ChatGPT Icon" style={{ marginRight: '5px', height: '20px', width: '20px' }} /> Enhance
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
      
            ))} 
          </div>
          </Container>
          <div style={{ textAlign: "center" }}>
            <button className="SignupButton" style={{
                    backgroundColor: `#575DFB`,
                    color: `black`,
                    border: `none`,
                    width:'200px',
                    borderRadius: '10px',
                    fontWeight:'bold',
                    marginBottom:'20px',
                  }} onClick={handleSubmitClick}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
