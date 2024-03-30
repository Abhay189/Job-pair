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

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
      <Route path="/" element={<div></div>} />
      {/* Add your page route here, like the examples given below : */}
      <Route path="/userprofile" element={<Profilepage/>} />
      <Route path="/companyprofile" element={<Companyprofilepage/>} />
      <Route path="/applicants" element={<JobApplicants/>} /> 
      <Route path="/applicationReview" element={<ApplicationReviewPage/>} />
      <Route path="/interview" element={<InterviewPage/>} />  
      <Route path="/admin/flagged-conversations" element={<AdminPanelPage />} />
      <Route path="/createjob" element={<CreateJobPage/>} />
      <Route path="/tracking" element={<TrackingPage/>} />
       <Route path= "/viewJobs" element={<Jobpage />}/>
       <Route path = "/editJob/:id" element={<CreateJobPage/>} />
 


      <Route path="*" element={<h1 style={{marginTop: `5%`, fontFamily:`Ubuntu`}}>Sorry, this page doesn't exist!</h1>} />
    </Routes>
    </div>
  );
}

export default App;
