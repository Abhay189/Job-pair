import React, { useState, useEffect } from 'react';
import '../Styles/LoginPage.css';
import logoImage from '../Assets/job-pair_new_logo.png';
import google from '../Assets/google.png';
import outlook from '../Assets/outlook.png';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = localStorage.getItem('API_BASE_URL');

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('seekers');
  const [errorMessage, setErrorMessage] = useState(''); // New state for managing error message
  const [id , setId] = useState('');
  let navigate = useNavigate();

  useEffect(() => {
    const temp_id = localStorage.getItem('id');
    if (temp_id != null) {
      console.error('User already logged in, redirecting to Homepage..');
      navigate('/viewJobs');
    }
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, {
        email: email,
        password: password,
        userType: userType
      });

      if (response.data.success) {
        console.log(response.data);
        setId(response.data.user_data.id);

        localStorage.setItem('id', id);
        localStorage.setItem('usertype', userType);

        navigate('/viewJobs');
      } else {
        // Update error message state to show error
        setErrorMessage('Authentication failed. Please check your email or password and try again.');
        console.error('Sign-in failed:', response.data.message);
      }
      
    } catch (error) {
      // Set error message based on the error caught
      setErrorMessage('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-container">
        <div className="signup-form">
          <h1>Sign In</h1>
          <div className="social-signup">
            <button className="google-signup">
              <img src={google} alt="Google logo" />
              Sign in with Google
            </button>
            <button className="outlook-signup">
              <img src={outlook} alt="Outlook logo" />
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
                <option value="admins">Admin</option>
              </select> 
              <span className="dropdown-arrow">&#9660;</span>
            </div>
            
            <button type="submit" className="create-account-button">Sign In</button>
          </form>
          <div className="error-message">{errorMessage}</div> {/* Display error message here */}
          <div className="signup-footer">
            <p>
              <Link to={'/signup'}>Don't have an account?</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="signup-image-section">
        <img src={logoImage} alt="I-Sole Diabetic Tracking" />
      </div>
    </div>
  );
};

export default LoginPage;
