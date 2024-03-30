import React, { useState } from 'react';
import '../Styles/LoginPage.css'; // Make sure this is the correct path to your CSS file
import logoImage from '../Assets/Job-pair-small 1.png'; // Update with the correct path to your logo image
import google from '../Assets/google.png'; // Update with the correct path to your logo image
import outlook from '../Assets/outlook.png'; // Update with the correct path to your logo image
import axios from 'axios'; // Import axios for making API requests
import { Link } from "react-router-dom";

const API_BASE_URL = 'http://127.0.0.1:5000';

const LoginPage = () => {
  const [username, setUsername] = useState(''); // Change to username
  const [password, setPassword] = useState('');

  const handleSignIn = async (e) => { // Change the function name to handleSignIn
    e.preventDefault();

    try {
      // Make a POST request to your backend sign-in endpoint
      const response = await axios.post(`${API_BASE_URL}/signin`, {
        username: username, // Use the username state variable
        password: password,
      });

      if (response.data.success) {
        // Authentication successful
        const { username, patientID, role } = response.data.user_data;
      
        // Store curr_username and patientID in local storage
        localStorage.setItem('curr_username', username);
        localStorage.setItem('patientID', patientID);
        localStorage.setItem('userRole', role);
      
        // Log curr_username for debugging
        console.log('curr_username:', username);
      
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
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
