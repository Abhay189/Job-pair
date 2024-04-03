import React, { useState, useEffect } from 'react';
import ApplicationReview from '../Components/ApplicationReview';
import MobileWarning from '../Components/MobileWarning';
import { useNavigate } from "react-router-dom";

const ApplicationReviewPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  let navigate = useNavigate();

  useEffect(()=> {
    const temp_id = localStorage.getItem('id');

    if (temp_id == null) {
        console.error('User not signed in, redirecting to login..');
        navigate('/');
    }
  },[]);
  

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as necessary
    };

    handleResize(); // Call it once to set initial state

    window.addEventListener('resize', handleResize); // Add event listener for window resize

    // Cleanup function to remove event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
       {isMobile ? <MobileWarning pageName="Application Review"/> : <ApplicationReview />} {/* Render MobileWarning or AdminPanel based on isMobile state */}
    </div>
  );
};

export default ApplicationReviewPage;
