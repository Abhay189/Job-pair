import './Styles/App.css';
import { Routes, Route } from 'react-router-dom';
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

function App() {

  localStorage.setItem('API_BASE_URL', 'http://127.0.0.1:5000');

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

  return (
       

    <Routes>
      <Route path="/login" element={<LoginLayout><LoginPage /></LoginLayout>} />
      <Route path="/signup" element={<LoginLayout><SignupPage /></LoginLayout>} />
      <Route path="/" element={<LoginLayout><LoginPage /></LoginLayout>} />
      <Route path="/userprofile" element={<MainLayout><Profilepage /></MainLayout>} />
      <Route path="/companyprofile" element={<MainLayout><Companyprofilepage /></MainLayout>} />
      <Route path="/applicants" element={<MainLayout><JobApplicants /></MainLayout>} />
      <Route path="/applicationReview" element={<MainLayout><ApplicationReviewPage /></MainLayout>} />
      <Route path="/interview" element={<MainLayout><InterviewPage /></MainLayout>} />
      <Route path="/admin/flagged-conversations" element={<MainLayout><AdminPanelPage /></MainLayout>} />
      <Route path="/createjob" element={<MainLayout><CreateJobPage /></MainLayout>} />
      <Route path="/tracking" element={<MainLayout><TrackingPage /></MainLayout>} />
      <Route path="/viewJobs" element={<MainLayout><Jobpage /></MainLayout>} />
      <Route path = "/editJob/:id" element={<CreateJobPage/>} />
      <Route path="/chat/:id" element={<MainLayout><ChatPage /></MainLayout>} />
      <Route path="/chats" element={<MainLayout><ViewChatList /></MainLayout>} />

      <Route path="*" element={<MainLayout><h1 style={{marginTop: `5%`, fontFamily:`Ubuntu`}}>Sorry, this page doesn't exist!</h1></MainLayout>} />
    </Routes>
  
  );
}

export default App;
