import React, { useState, useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../Styles/Navbar.css'; // Make sure to create a corresponding CSS file
import logo from '../Assets/job-pair_new_logo.png'; // Update with the correct path to your logo image

const CustomNavbar = () => {
  const navigate = useNavigate(); 
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Assuming the user type is stored in local storage after login
    const storedUserType = localStorage.getItem('userType'); // Changed 'usertype' to 'userType'
    console.log('Stored User Type:', storedUserType);
    setUserType(storedUserType);
  }, []);  

  const handleLogout = () => {
    localStorage.removeItem('usertype');
    localStorage.removeItem('id');
    navigate('/');
  };

  // Define the buttons for each user type
  const adminButtons = [
    { to: "/viewJobs", text: "Jobs Dashboard" },
    { to: "/admin/flagged-conversations", text: "Flagged Chats" },
  ];

  const recruiterButtons = [
    { to: "/viewJobs", text: "Jobs" },
    { to: "/companyprofile", text: "Company Profile" },
    { to: "/chats", text: "Chats" },
  ];

  const seekerButtons = [
    { to: "/viewJobs", text: "View Jobs" },
    { to: "/tracking", text: "Job Tracking " },
    { to: "/interview", text: "Mock Interview" },
    { to: "/chats", text: "Chats" },
    { to: "/userprofile", text: "Profile" },
  ];

  // Helper function to render buttons based on the user type
  const renderButtons = (buttons) => {
    console.log("User Type: ", userType)
    return buttons.map((button, index) => (
      <LinkContainer key={index} to={button.to}>
        <Nav.Link onClick={button.onClick}>{button.text}</Nav.Link>
      </LinkContainer>
    ));
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="light" variant="light" className="custom-navbar">
      <Navbar.Brand href="/">
        <img src={logo} alt="Brand logo" height="40" className="d-inline-block align-top custom-logo" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          {userType === 'admins' && renderButtons(adminButtons)}
          {userType === 'recruiters' && renderButtons(recruiterButtons)}
          {userType === 'seekers' && renderButtons(seekerButtons)}
        </Nav>
        <Nav>
          <Nav.Link to="/" onClick={handleLogout}>Logout</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
