import React, { useState, useEffect } from 'react';
import AdminPanel from '../Components/AdminPanel';
import MobileWarning from '../Components/MobileWarning';

const AdminPanelPage = () => {
  const [isMobile, setIsMobile] = useState(false);

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
       {isMobile ? <MobileWarning pageName="Admin Panel"/> : <AdminPanel />} {/* Render MobileWarning or AdminPanel based on isMobile state */}
    </div>
  );
};

export default AdminPanelPage;
