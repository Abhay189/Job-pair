import { useEffect, useState } from "react";
import Axios from 'axios';
import '../Styles/ApplicationReview.css'
// import { chatgptlogo } from "../Constants";
import chatgpt from '../Assets/chatgpt.png'

import {
  Container,
//   DropdownButton,
//   Dropdown,
//   Row,
//   Form,
//   FormLabel,
//   Button,
//   Card,
//   Modal,
//   Col,
} from "react-bootstrap";

// import "../Styles/SalariesPageStyles.css";
import "../Styles/LearningPageStyles.css";
// import "../Styles/LearningPageStyles.css"; // Import the new CSS file here
import { styles } from "../Styles/styles";
import { useParams } from 'react-router-dom';

export default function ApplicationReview() {

  const { id } = useParams();  // Extracting the id from the route

  // const param1 = localStorage.getItem("ApplicationReviewTitle");
  const param1 = "Financial Analyst"
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedText, setEditedText] = useState("");

  const redirectToJobs = () => {
    window.location.reload();
    // Redirects to the main page
    window.location.href = "http://localhost:3000/viewJobs";
  };

  useEffect(() => {
    const jobUrl = `http://127.0.0.1:5002/get_all_jobs?id=${id}&userType=seekers`;  // URL to get job details
  
    Axios.get(jobUrl, {})
      .then((res) => {
        const jsonData = res.data;
        console.log("Fetched data:", jsonData);
  
        if (jsonData.length > 0) {
          const jobData = jsonData.find(item => item.id === Number(11));
          if (jobData) {
            console.log("Job data found:", jobData);
            setJobDescription(jobData.Description);
            setJobName(jobData.Title);
            setQuestions(jobData.Questions);
  
            // Fetch responses for the job using another endpoint
            const answersUrl = `http://127.0.0.1:5002/get_job_answer?job_id=11&user_id=1`;  // Include user ID as needed
            return Axios.get(answersUrl);  // Return the promise for chaining
          } else {
            console.error(`Job with id ${id} not found in jsonData`);
          }
        }
      })
      .then((response) => {
        if (response && response.data) {
          console.log("Responses fetched:", response.data);
          setResponses(response.data.answers);  // Assuming the endpoint returns an object with an 'answers' key
        }
      })
      .catch((error) => {
        console.error("Error fetching job responses:", error);
      });
  }, [id]);  // Only id is needed as a dependency now, as we are no longer using jobName
  
  const handleEditClick = (index) => {
    console.log('Responses:', responses);
    console.log('Index:', index);
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
        // Fetch the enhanced response
        const enhancedResponse = await Axios.post("http://127.0.0.1:5002/get_enhanced_essay", {
            question: questions[index],
            answer: responses[index],
        });

        // Check if we actually received the enhanced response
        if (enhancedResponse && enhancedResponse.data && enhancedResponse.data.response) {
            const updatedResponses = [...responses];
            updatedResponses[index] = enhancedResponse.data.response;
            setResponses(updatedResponses);

            // Save the updated response to the server
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
    console.log(jobName);
    try {
      const userId = localStorage.getItem('id');
      await Axios.post("http://127.0.0.1:5002/submit_application", {
        id:userId,
        job_id: id,
        
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
          <div className={`${styles.heroHeadText}`} style={{ fontWeight: 'bold', fontSize: '50px', textAlign: 'center', marginBottom: '35px', paddingTop: `70px` }}>{jobName}</div>
          <p className={`${styles.heroHeadText}`} style={{ fontSize: '25px', textAlign: 'center', marginBottom: '35px' }}>{jobDescription}</p>
          <Container className="outer-container" style={{ minHeight: `100vh`, minWidth:`100vh` }}>
          <div className="questiondiv"  style={{ minHeight: `100vh`, minWidth:`100vh`, alignContent:`center`, alignItems:`center` }}>
            {questions.map((questionItem, index) => (
              <div key={index} className="question-container" style={{ display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: "50rem", height: "100%", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', margin: `1% 0`, border:'solid', borderWidth:'4px', borderColor:'#f0f0f0', borderRadius: '15px', padding: '15px', position: 'relative', alignText: 'center', justifyContent: 'space-between'  }}>
                    <strong className={`${styles.heroHeadText}`} style={{ fontSize: '20px', textAlign: 'center', marginBottom: '35px' }}>Question:</strong> {questions[index]}
                    <br />
                </div>
                <div style={{ width: "50rem", height: "100%", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', background: '#f0f0f0', margin: `1% 0`, border:'solid', borderWidth:'4px', borderColor:'#f0f0f0', borderRadius: '15px', padding: '15px', position: 'relative', alignText: 'center', justifyContent: 'space-between'  }}>
                <label htmlFor={`textInput-${index}`} className={`${styles.heroHeadText}`}  style={{ fontSize: '20px', fontWeight:'bold', textAlign: 'center'}} >Answer:</label>
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
                        <button className="invisiblePadding saveButton" style={{ marginRight: '10px', fontWeight:'bold', color:'black'  }} onClick={() => handleSaveClick(index)}>Save</button>
                      </div>
                    ) : (
                      <div>
                        <div className="answer-container" style={{ overflow: 'hidden' }}>
                          {/* <p style={{ whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{responses[0]}</p> */}
                          <p style={{ whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{responses[index]}</p>
                        </div>
                        <div className="buttonContainer" style={{ display: 'flex', flexDirection: 'row', alignItems: 'left', justifyContent: 'left' }}>
                          <span style={{ padding: '0 8px' }}></span>
                          <button className="invisiblePadding editButton" style={{ height: '35px', marginRight: '10px', fontWeight: 'bold', color: 'white', backgroundColor: '#575DFB', borderRadius: '15px', border: 'none', }} onClick={() => handleEditClick(index)}>Edit</button>
                          <span style={{ padding: '0 8px' }}></span>
                          <button className="invisiblePadding enhanceButton" style={{ width: '140px', marginRight: '10px', fontWeight: 'bold', color: 'white', backgroundColor: '#575DFB', borderRadius: '15px', border: 'none', display: 'flex', flex: 'wrap' }} onClick={() => handleEnhanceClick(index)}>
                            <img src={chatgpt} alt="ChatGPT Icon" style={{ marginRight: '5px', height: '30px', width: '30px' }} /> Enhance
                          </button>
                          <span style={{ padding: '0 8px' }}></span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
      
            ))} 
          </div>
          </Container>
          <div style={{ textAlign: "center" }}>
            <button className="SignupButton"   style={{
                    backgroundColor: `#575DFB`,
                    color: `black`,
                    border: `none`,
                    width:'400px',
                    borderRadius: '15px',
                    fontWeight:'bold',
                    marginBottom:'40px',
                  }} onClick={handleSubmitClick}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
