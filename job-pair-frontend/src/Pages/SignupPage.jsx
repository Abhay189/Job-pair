import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/SignupPage.css'; // Make sure this is the correct path to your CSS file
import logoImage from '../Assets/job-pair_new_logo.png'; // Update with the correct path to your logo image
import google from '../Assets/google.png'; // Update with the correct path to your logo image
import outlook from '../Assets/outlook.png'; // Update with the correct path to your logo image
import { Link, useNavigate} from "react-router-dom";

const API_BASE_URL = 'http://127.0.0.1:5002';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('seekers'); // Initialize role state
  const [username, setUsername] = useState(''); // State for username
  let navigate = useNavigate();

  useEffect(() => {
    const temp_id = localStorage.getItem('id');
    if (temp_id != null) {
      console.error('User already logged in, redirecting to Homepage..');
      navigate('/setupInfo');
    }
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
        const signupResponse = await axios.post(`${API_BASE_URL}/signup`, {
            username: username,
            email: email,
            password: password,
            fullName: fullName,
            userType: userType,
        });

        if (signupResponse.data.success) {
            console.log("Account created successfully");

            const { id } = signupResponse.data.user_data;

            localStorage.setItem('userType',userType);
            localStorage.setItem('id',id);

            navigate('/setupInfo');
        } else {
            console.log("Failed to create account");
        }
      } catch (error) {
          console.error('Error during sign up:', error);
      }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-image-section">
        {/* This will be the left side with your image or design */}
        <img src={logoImage} alt="I-Sole Diabetic Tracking" />
      </div>
      <div className="signup-form-container">
        <div className="signup-form">
          <h1>Create Account</h1>

          <div className="social-signup">

            <button className="google-signup">
              <img src={google} alt="Google logo" /> {/* Replace with your image path */}
              Sign up with Google
            </button>

            <button className="outlook-signup">
              <img src={outlook} alt="Outlook logo" /> {/* Replace with your image path */}
              Sign up with Outlook
            </button>

          </div>

          <div className="divider">
            <span>OR</span>
          </div>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username" // New input field for username
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
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

            <button type="submit" className="create-account-button">Create Account</button>
          </form>
          <div className="signup-footer">
            <p>
              <Link to={'/login'}>Already have an account?</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
