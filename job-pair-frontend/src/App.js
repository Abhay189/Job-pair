import './Styles/App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar.jsx';
import Profilepage from './Pages/Profilepage.jsx';
import './Styles/custom.css';
import Companyprofilepage from './Pages/Companyprofilepage.jsx';
import JobApplicants from './Pages/JobApplicants.jsx';
import AdminPanelPage from './Pages/AdminPanelPage.jsx'; 
import InterviewPage from './Pages/InterviewPage.jsx';
import CreateJobPage from './Pages/CreateJobPage.jsx'; 
import TrackingPage from './Pages/TrackingPage.jsx';
import Jobpage from './Pages/Jobpage.jsx';
import ApplicationReviewPage from './Pages/ApplicationReviewPage.jsx';
import LoginPage from './Pages/LoginPage.jsx'
import SignupPage from './Pages/SignupPage.jsx';
import ChatPage from './Pages/ChatPage.jsx';
import ViewChatList from './Pages/ViewChatList.jsx';
import SetupInfoPage from './Pages/SetupInfoPage.jsx';
// chat gpt used on this project on some the frontend files to help with styling, react components and html structure
function App() {

  localStorage.setItem('API_BASE_URL', 'http://127.0.0.1:5002');

  // MainLayout includes Navbar
  function MainLayout({ children }) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
      </>
    );
  }

  // LoginLayout is a plain layout without Navbar
  function LoginLayout({ children }) {
    return <main>{children}</main>;
  }

  const navigate = useNavigate();
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const tempUserType = localStorage.getItem('userType');
    setUserType(tempUserType);
  }, []);

  return (
       

    <Routes>
      <Route path="/login" element={<LoginLayout><LoginPage /></LoginLayout>} />
      <Route path="/signup" element={<LoginLayout><SignupPage /></LoginLayout>} />
      <Route path="/" element={<LoginLayout><LoginPage /></LoginLayout>} />
      <Route path="/userprofile" element={<MainLayout><Profilepage /></MainLayout>} />
      <Route path="/companyprofile" element={<MainLayout><Companyprofilepage /></MainLayout>} />
      <Route path="/applicants/:id" element={<MainLayout><JobApplicants /></MainLayout>} />
      <Route path="/applicationReview/:id" element={<MainLayout><ApplicationReviewPage /></MainLayout>} />
      <Route path="/interview" element={<MainLayout><InterviewPage /></MainLayout>} />
      <Route path="/admin/flagged-conversations" element={<MainLayout><AdminPanelPage /></MainLayout>} />
      <Route path="/createjob" element={<MainLayout><CreateJobPage /></MainLayout>} />
      <Route path="/tracking" element={<MainLayout><TrackingPage /></MainLayout>} />
      <Route path="/viewJobs" element={<MainLayout><Jobpage /></MainLayout>} />
      <Route path="/setupInfo" element={<SetupInfoPage />} />
      <Route path = "/editJob/:id" element={<CreateJobPage/>} />
      <Route path="/chat/:id" element={<MainLayout><ChatPage /></MainLayout>} />
      {userType === 'admins' ? (
          <Route path="/chats" element={<MainLayout><AdminPanelPage /></MainLayout>} />
        ) : (
          <Route path="/chats" element={<MainLayout><ViewChatList /></MainLayout>} />
        )}
      <Route path="/chats" element={<MainLayout><ViewChatList /></MainLayout>} />

      <Route path="*" element={<MainLayout><h1 style={{marginTop: `5%`, fontFamily:`Ubuntu`}}>Sorry, this page doesn't exist!</h1></MainLayout>} />
    </Routes>
  
  );
}

export default App;
