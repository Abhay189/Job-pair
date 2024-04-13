import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import '../Styles/TrackingPage.css';
import { styles } from "../Styles/Trackingpagestyles";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://127.0.0.1:5002';

const TrackingPage = () => {

  let navigate = useNavigate();
  const [userId, setUserId] = useState(0);

  const [applications, setApplications] = useState({
    applied: [],
    in_progress: [],
    interview: [],
    accepted: [],
    rejected: [],
  });

    const redirectToApplicationReview = (applicationTitle,applicationjobID) => {
      // console.log("im clicked")
      console.log(applicationTitle);
      let redirectHappened = false;

      for (const [key, value] of Object.entries(applications)) {
        console.log("hello", key, value);

        if (key === 'interview') {
          for (const val of value) {
            console.log(val.job_title, applicationTitle);
            if (val.job_title === applicationTitle) {
              console.log('redirecting');
              window.location.reload();
              window.location.href = "http://localhost:3000/interview";
              redirectHappened = true;
              break;
            }
          }
        }

        if (redirectHappened) {
          break; // Break the outer loop if the redirect condition has been met
        }
      }
      if(!redirectHappened){
        localStorage.setItem("ApplicationReviewTitle",applicationTitle);
        // Reloads the current page
        window.location.reload();
        // Redirects to the main page
        window.location.href = `http://localhost:3000/applicationReview/${applicationjobID}`;
      } 
  };

  const Get_Title_Name = (given_name) => {
    switch (given_name) {
      case "applied":
        return "Applied";
      case "in_progress":
        return "In Progress";
      case "interview":
        return "Interview";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      default:
        return given_name; // return the given name if it doesn't match any case
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const tempId = localStorage.getItem('id');
      
      if (tempId == null) {
        console.error('User not signed in, redirecting to login..');
        navigate('/');
        return;
      }
      
      setUserId(tempId);

      try {
        const response = await axios.get(`${API_BASE_URL}/get_all_applied_jobs`, {
          params: { 'id': tempId }
        });

        const categorizedApplications = {
          "applied": [],
          "in_progress": [],
          "interview": [],
          "accepted": [],
          "rejected": [],
        };

        response.data['applied_jobs'].forEach((application) => {
      
          const status = application.application_status;
          console.log(application);
          categorizedApplications[status].push(application);
        });

        setApplications(categorizedApplications);
      } catch (error) {
        console.error('Error fetching job applications:', error);
      }
    };

    fetchData();
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      const updatedApplications = { ...applications };
      const sourceColumn = updatedApplications[source.droppableId];
      const destinationColumn = updatedApplications[destination.droppableId];
      const movedApplication = sourceColumn.find(
        (app) => app.id === draggableId
      );

      sourceColumn.splice(source.index, 1);
      destinationColumn.splice(destination.index, 0, movedApplication);
      setApplications(updatedApplications);

      try {
        console.log(destination);
        await axios.post(`${API_BASE_URL}/update_job_status`, {
          user_id: userId,
          application_id: movedApplication.id,
          new_status: destination.droppableId,
        });
      }
      catch (error){
        console.error("Error occoured while updating database, ", error);
      }
    }
  };

  return (

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="TrackingPage">
          <h1>Application Tracking</h1>
          <div className="columns-container ">
            {Object.keys(applications).map((column) => (
              
              <Droppable droppableId={column} key={column}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="column"
                  >
                    <h2 className={`${styles.SubHeader}`} style={{ fontSize: '3em', textAlign: 'center', paddingTop: `15px`, paddingBottom:`10px`, fontWeight:`bolder`, color:`white`}}>{Get_Title_Name(column)}</h2>
                    {applications[column].map((application, index) => (
                      <Draggable
                        key={application.id}
                        draggableId={application.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                            onClick={() => redirectToApplicationReview(application.job_title,application.job_id)}
                          >
                            <p>{application.job_title}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

  );
  
};

export default TrackingPage;