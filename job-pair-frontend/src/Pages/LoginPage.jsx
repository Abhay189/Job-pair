import React, { useState, useEffect } from 'react';
import '../Styles/LoginPage.css'; // Make sure this is the correct path to your CSS file
import logoImage from '../Assets/job-pair_new_logo.png'; // Update with the correct path to your logo image
import google from '../Assets/google.png'; // Update with the correct path to your logo image
import outlook from '../Assets/outlook.png'; // Update with the correct path to your logo image
import axios from 'axios'; // Import axios for making API requests
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = localStorage.getItem('API_BASE_URL');

const LoginPage = () => {
  const [email, setEmail] = useState(''); // Change to username
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('seekers'); // Initialize role state
  const [id , setId] = useState('');
  let navigate = useNavigate();

  useEffect(() => {
    const temp_id = localStorage.getItem('id');
    if (temp_id != null) {
      console.error('User already logged in, redirecting to Homepage..');
      navigate('/viewJobs');
    }
  }, []);

  const handleSignIn = async (e) => { // Change the function name to handleSignIn
    e.preventDefault();

    try {
      // Make a POST request to your backend sign-in endpoint
      const response = await axios.post(`${API_BASE_URL}/signin`, {
        email: email, // Use the username state variable
        password: password,
        userType: userType
      });

      if (response.data.success) {
        // Authentication successful
        console.log(response.data);
        setId(response.data.user_data.id);
      
        localStorage.setItem('id', id);
        localStorage.setItem('usertype', userType);

        navigate('/viewJobs');
    
      
      } else {
        // Authentication failed, handle the error (e.g., show an error message)
        console.error('Sign-in failed:', response.data.message);
      }
      
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
      }
      console.error(error.config);
    }
    
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-container">
        <div className="signup-form">
          <h1>Sign In</h1>

          <div className="social-signup">

            <button className="google-signup">
              <img src={google} alt="Google logo" /> {/* Replace with your image path */}
              Sign in with Google
            </button>

            <button className="outlook-signup">
              <img src={outlook} alt="Outlook logo" /> {/* Replace with your image path */}
              Sign in with Outlook
            </button>

          </div>

          <div className="divider">
            <span>OR</span>
          </div>
          <form onSubmit={handleSignIn}>
            <input
              type="text" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="dropdown-container">
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="seekers">Job Seeker</option>
                <option value="recruiters">Recruiter</option>
              </select> 
              <span className="dropdown-arrow">&#9660;</span>
            </div>

            <button type="submit" className="create-account-button">Sign In</button>
          </form>
          <div className="signup-footer">
            <p>
              <Link to={'/signup'}>Don't have an account?</Link>
              {/* <a href="#signup">Don't have an account?</a> */}
            </p>
          </div>

        </div>
      </div>

      <div className="signup-image-section">
        {/* This will be the left side with your image or design */}
        <img src={logoImage} alt="I-Sole Diabetic Tracking" />
      </div>

    </div>
  );
};

export default LoginPage;
