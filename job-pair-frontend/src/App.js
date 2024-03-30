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

function App() {
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
      {/* more routes */}
      <Route path="/userprofile" element={<MainLayout><Profilepage /></MainLayout>} />
      <Route path="/companyprofile" element={<MainLayout><Companyprofilepage /></MainLayout>} />
      <Route path="/applicants" element={<MainLayout><JobApplicants /></MainLayout>} />
      <Route path="/applicationReview" element={<MainLayout><ApplicationReviewPage /></MainLayout>} />
      <Route path="/interview" element={<MainLayout><InterviewPage /></MainLayout>} />
      <Route path="/admin/flagged-conversations" element={<MainLayout><AdminPanelPage /></MainLayout>} />
      <Route path="/createjob" element={<MainLayout><CreateJobPage /></MainLayout>} />
      <Route path="/tracking" element={<MainLayout><TrackingPage /></MainLayout>} />
      <Route path="/viewJobs" element={<MainLayout><Jobpage /></MainLayout>} />
      <Route path="*" element={<MainLayout><h1 style={{marginTop: `5%`, fontFamily:`Ubuntu`}}>Sorry, this page doesn't exist!</h1></MainLayout>} />
    </Routes>
  
    // <div className="App">
    //   <Navbar />
    //   <Routes>
    //   <Route path= "/" element={<LoginPage />}/>
    //   <Route path= "/login" element={<LoginPage />}/>
    //   <Route path= "/signup" element={<SignupPage />}/>
    //   <Route path="/userprofile" element={<Profilepage/>} />
    //   <Route path="/companyprofile" element={<Companyprofilepage/>} />
    //   <Route path="/applicants" element={<JobApplicants/>} /> 
    //   <Route path="/applicationReview" element={<ApplicationReviewPage/>} />
    //   <Route path="/interview" element={<InterviewPage/>} />  
    //   <Route path="/admin/flagged-conversations" element={<AdminPanelPage />} />
    //   <Route path="/createjob" element={<CreateJobPage/>} />
    //   <Route path="/tracking" element={<TrackingPage/>} />
    //   <Route path= "/viewJobs" element={<Jobpage />}/>
    //   <Route path="*" element={<h1 style={{marginTop: `5%`, fontFamily:`Ubuntu`}}>Sorry, this page doesn't exist!</h1>} />
    // </Routes>
    // </div>
  );
}

export default App;
