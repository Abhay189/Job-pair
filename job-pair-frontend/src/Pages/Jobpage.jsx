import Axios from "axios";
import { useEffect, useState } from "react";
import '../Styles/jobpage.css'
import {Button} from "react-bootstrap";
import JobCard from "../Components/Jobcard";
import Filter from "../Components/JobFilter";
import { useNavigate } from "react-router-dom";

export default function Jobpage() {
    const [jobs, setJobs] = useState([]);
    const [userType, setUserType] = useState("");
    const navigate = useNavigate();

    const createJob = () => {
        navigate('/createJob');
    }


    useEffect(() => {

        const temp_id = localStorage.getItem('id');

        if (temp_id == null) {
            console.error('User not signed in, redirecting to login..');
            navigate('/');
        }

        const fetchData = async () => {
            try {
                const id = localStorage.getItem('id');
                const userType = localStorage.getItem('userType');
                const response = await Axios.get("http://127.0.0.1:5002/get_all_jobs",{ 
                    params:{
                    id,userType
                    }
                  }  )
                console.log(response);
                setJobs(response.data);

            } catch (error) {
                console.error("Error in getting resources for job page", error);
                setJobs([
                   
                ])
            }
        };

        fetchData();
        const localStoragetype = localStorage.getItem('userType');
        console.log(localStoragetype);
        setUserType(localStoragetype);

    }, [])

   const deleteJobFunction = async (jobId) => {
    try {
        const response = await Axios.delete('http://127.0.0.1:5002/delete-job', {
            params: { job_id: jobId }
        });
        console.log(response.data);
        const newJobs = jobs.filter((job) => job.id !== jobId);
        setJobs(newJobs);
    } catch (error) {
        console.error('Error delete: ', error);
    }
    }






    return (
        <>
        <div className="jobs-container">

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

            <div className="job-mobile-container">
                <div className="jobs-body-mobile">
                    {jobs?.map((job) => {
                        return (
                            <JobCard job={job} userType={userType}></JobCard>
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
    </>
    );
}

