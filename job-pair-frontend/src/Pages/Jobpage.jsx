import Axios from "axios";
import { useEffect, useState } from "react";
import '../Styles/jobpage.css'
import {Button} from "react-bootstrap";
import JobCard from "../Components/Jobcard";
import Filter from "../Components/JobFilter";
import { useNavigate } from "react-router-dom";

export default function Jobpage() {
    const [jobs, setJobs] = useState([]);
    const [userType, setUserType] = useState("")
    const navigate = useNavigate();

    const createJob = () => {
        navigate('/createJob');
    }


    useEffect(() => {

        const fetchData = async () => {
            try {
                const id = localStorage.getItem('id');
                const userType = localStorage.getItem('userType');
                const response = await Axios.get("http://127.0.0.1:5000/get_all_jobs",{ 
                    params:{
                    id,userType
                    }
                  }  )
                console.log(response);
                setJobs(response.data);

            } catch (error) {
                console.error("Error in getting resources for job page", error);
                setJobs([
                    {
                        id: 1,
                        logoUrl: 'https://banner2.cleanpng.com/20180324/sww/kisspng-google-logo-g-suite-chrome-5ab6e618b3b2c3.5810634915219358967361.jpg', 
                        title: 'Entry Level - Software Developer',
                        location: 'Calgary, Alberta / Remote',
                        applicants: 129,
                        postingDate: '2024-01-10',
                        applicantsList: [],
                        companyName: 'Google'

                    },
                    {
                        id: 2,
                        logoUrl: 'https://banner2.cleanpng.com/20180324/sww/kisspng-google-logo-g-suite-chrome-5ab6e618b3b2c3.5810634915219358967361.jpg', 
                        title: 'Senior Software Developer',
                        location: 'Calgary, Alberta / Remote',
                        applicants: 129,
                        postingDate: '2024-01-10',
                        applicantsList: [],
                        companyName: 'Google'

                    }
                ])
            }
        };

        fetchData();
        debugger;
        const localStoragetype = localStorage.getItem('userType');
        console.log(localStoragetype);
        setUserType(localStoragetype);

    }, [])

   const deleteJobFunction = async (jobId) => {
        try {
            const response = await Axios.delete("http://localhost:3000/delete_job/" + jobId, {
            })
            const newJobs = jobs.filter(job => job.id !== jobId);
            setJobs(newJobs);

        } catch (error) {
            console.error("Error in getting resources for job page", error);
        }
    }






    return (
        <>
        <div className="jobs-container">

            <h1 style={{ fontWeight: 'bold', fontSize: '50px', textAlign: 'center', marginBottom: '35px', paddingTop: `70px` }}>Jobs</h1>
            <div className="job-main-content-wrapper">


                <Filter />

                <div className="job-right-div">
                    <div className="jobs-body">
                        {jobs?.map((job) => {
                            return (
                                <JobCard job={job} userType={userType} deleteJobFunction={deleteJobFunction}></JobCard>

                            );
                        })}
                    </div>
                    {userType === 'recruiters' &&
                        <div className="create-job-button-wrapper">
                            <Button size="lg" variant="primary" onClick={createJob}>
                                Create Job
                            </Button>
                        </div>

                    }
                </div>
            </div>

           


        </div>

<div className="job-mobile-container">
<div>
        <Filter></Filter>
    </div>
    <div className="job-right-div-mobile">
        <div className="jobs-body-mobile">
            {jobs?.map((job) => {
                return (
                    <JobCard job={job} userType={userType}></JobCard>

                );
            })}
        </div>
        {userType === 'recruiter' &&
            <div className="create-job-button-wrapper">
                <Button size="lg" variant="primary" onClick={createJob}>
                    Create Job
                </Button>
            </div>

        }
    </div>


    </div>
    </>
    );
}

