import Axios from "axios";
import { useEffect, useState } from "react";
import '../Styles/jobpage.css'
import {Button} from "react-bootstrap";
import JobCard from "../Components/Jobcard";
import Filter from "../Components/JobFilter";

const API_BASE_URL = 'http://127.0.0.1:5000';

export default function Jobpage() {
    const [jobs, setJobs] = useState([]);
    const [userType, setUserType] = useState("recruiter")

    const createJob = () => {

    }


    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await Axios.get(`${API_BASE_URL}/get_all_jobs/`, {
                })
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

    }, [])

   






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
                                <JobCard job={job} userType={"recruiter"}></JobCard>

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

           


        </div>

<div className="job-mobile-container">
<div>
        <Filter></Filter>
    </div>
    <div className="job-right-div-mobile">
        <div className="jobs-body-mobile">
            {jobs?.map((job) => {
                return (
                    <JobCard job={job} userType={"recruiter"}></JobCard>

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

