import './Styles/App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar.jsx'
import Profilepage from './Pages/Profilepage.jsx';
import './Styles/custom.css';
import Companyprofilepage from './Pages/Companyprofilepage.jsx';
import Jobpage from './Pages/Jobpage.jsx';
import JobApplicants from './Pages/JobApplicants.jsx';
import AdminPanelPage from './Pages/AdminPanelPage.jsx';
import CreateJobPage from './Pages/CreateJobPage.jsx'; 
import TrackingPage from './Pages/TrackingPage.jsx';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
      <Route path="/" element={<div></div>} />
      {/* Add your page route here, like the examples given below : */}
      <Route path="/userprofile/:id" element={<Profilepage/>} />
      <Route path="/companyprofile/:id" element={<Companyprofilepage/>} />
      <Route path="/jobpage/:id" element={<Jobpage/>} />
      <Route path="/applicants/:id" element={<JobApplicants/>} /> 
      <Route path="/admin/flagged-conversations" element={<AdminPanelPage />} />
      <Route path="/createjob" element={<CreateJobPage/>} />
      <Route path="/tracking" element={<TrackingPage/>} />
      {/* <Route path="/tracking" element={<TrackingPage2 />} />
      <Route path="/scholarships" element={<JobsPage />} />
      <Route path="/salaries" element={<SalariesPage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/employersignup" element={<EmployerSignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/profileBuilder" element={<ProfileBuilder />} />
      <Route path="/applicationReview" element={<ApplicationReview />} />
      <Route path="/employerdashboard" element={<EmployerDashboardPage />} /> */}


      <Route path="*" element={<h1 style={{marginTop: `5%`, fontFamily:`Ubuntu`}}>Sorry, this page doesn't exist!</h1>} />
    </Routes>
    </div>
  );
}

export default App;
