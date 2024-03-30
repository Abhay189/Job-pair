import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import '../Styles/TrackingPage.css';
import {  Container } from "react-bootstrap";
import { styles } from "../Styles/Trackingpagestyles"

const API_BASE_URL = 'http://127.0.0.1:5000';

const TrackingPage = () => {
  const [applications, setApplications] = useState({
    applied: [],
    in_progress: [],
    interview: [],
    accepted: [],
    rejected: [],
  });

    const redirectToApplicationReview = (applicationTitle) => {
    localStorage.setItem("ApplicationReviewTitle",applicationTitle);
    // Reloads the current page
    window.location.reload();
    // Redirects to the main page
    window.location.href = "http://localhost:3000/applicationReview";
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
    // Fetch scholarship applications from the backend
    axios.get(`${API_BASE_URL}/get_all_applied_jobs`, {
      params: {
        'id' : 1
      }
    })
      .then((response) => {
        const categorizedApplications = {
          applied: [],
          in_progress: [],
          interview: [],
          accepted: [],
          rejected: [],
        };

        console.log( response.data);

        // Categorize applications based on the 'status' key in the response
        response.data['applied_jobs'].forEach((application) => {
          const Status  = application.application_status;
          categorizedApplications[Status].push(application);
        });

        // Set the categorized applications to the state
        setApplications(categorizedApplications);
      })
      .catch((error) => {
        console.error('Error fetching Job applications:', error);
      });
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
        (app) => app.job_id === draggableId
      );

      sourceColumn.splice(source.index, 1);
      destinationColumn.splice(destination.index, 0, movedApplication);
      setApplications(updatedApplications);

      try {
        console.log(destination);
        await axios.post(`${API_BASE_URL}/update_job_status`, {
          user_id: 1,
          job_id: movedApplication.job_id,
          new_status: destination.droppableId,
        });
      }
      catch (error){
        console.error("Error occoured while updating database, ", error);
      }
    }
  };

  return (
    <Container style={{ minHeight: `100vh`, minWidth:`100vh` }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="TrackingPage">
          <div className="columns-container ">
            {Object.keys(applications).map((column) => (
              
              <Droppable droppableId={column} key={column}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="column"
                  >
                    <h2 className={`${styles.SubHeader}`} style={{ fontWeight: 'bold', fontSize: '28px', textAlign: 'center', paddingTop: `15px`, paddingBottom:`10px`, fontWeight:`bolder`, color:`#7F95D1`}}>{Get_Title_Name(column)}</h2>
                    {applications[column].map((application, index) => (
                      <Draggable
                        key={application.job_id}
                        draggableId={application.job_id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                            onClick={() => redirectToApplicationReview(application.Title)}
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
    </Container>
  );
  
};

export default TrackingPage;