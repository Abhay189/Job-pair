import React, { useState, useEffect } from 'react';
// import FeedbackForm from './FeedbackForm';
import axios from 'axios';  // Import axios
import '../Styles/ChatPage.css';

// Message component to display text, date, and time
const Message = ({ text, date, time, isUser }) => {
  const messageClass = isUser ? 'user' : 'other';
  return (
    <div className={`message ${messageClass}`}>
      <div className="message-text">{text}</div>
      <div className="message-footer">
        <div className="message-time">{time}</div>
      </div>
    </div>
  );
};


const ChatPage = ({ onBack, selectedMessages,threadIndex }) => {
  const [messages, setMessages] = useState([]);
  const [currUsername, setCurrUsername] = useState('');
  const [patientUsername, setpatientUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [doctorUsername, setDoctorUsername] = useState(''); 
  

  useEffect(() => {

    const storedUsername = localStorage.getItem('curr_username');
    const patientUsername = localStorage.getItem('patientUsername');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedUsername) {
      setCurrUsername(storedUsername);
    } else {
      console.error("Username not found in local storage");
    }

    if (patientUsername) {
      setpatientUsername(patientUsername);
    } else {
      console.error("Username not found in local storage");
    }

    if (storedUserRole) {
      setUserRole(storedUserRole);
    } else {
      console.error("User Role not found in local storage");
    }

    getDoctorUsername();

    if (Array.isArray(selectedMessages) && selectedMessages.length > 0) {
      const initialMessages = selectedMessages.map(msg => ({
        text: msg.message,
        date: msg.date,
        time: msg.time,
        isUser: msg.sender === currUsername // Check if the sender is the current user
      }));
      setMessages(initialMessages);
    }
  }, [selectedMessages, currUsername, patientUsername]);

  // Function to retrieve the doctorUsername
  const getDoctorUsername = async () => {
    try {
      const response = await axios.get(`https://i-sole-backend.com/get_my_doctor/${patientUsername}`);
      if (response.data.success) {
        const doctor = response.data.myDoctor;
        // Set the doctorUsername state variable
        setDoctorUsername(doctor);
      } else {
        console.error("Failed to fetch doctor username");
      }
    } catch (error) {
      console.error("Error fetching doctor username:", error);
    }
  };

  const sendChat = async (chatMessage) => {
    if (chatMessage.trim() !== '') {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString(); // Format as 'MM/DD/YYYY'
      const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format as 'HH:MM AM/PM'

      setMessages(prevMessages => [...prevMessages, { text: chatMessage, date: formattedDate, time: formattedTime, isUser: true }]);
      
      try {
        const response = await axios.post('https://i-sole-backend.com/add_message', {
          username: patientUsername,
          index: threadIndex,
          message: chatMessage,
          sender: currUsername
        });

        console.log('Message sent to server:', response.data);
      } catch (error) {
        console.error('Error sending message to server:', error);
      }
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-page-header">
      <h1>
        {userRole === 'Doctor' ? `${patientUsername}` : (doctorUsername ? `Dr. ${doctorUsername}` : <br/>)}
      </h1>
      </div>
      <div className="top-right">
        <button className="back-button" onClick={onBack}>Exit</button>
      </div>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} date={msg.date} time={msg.time} isUser={msg.isUser} />
        ))}
      </div>
      {/* <div className="feedback-form-container">
        <FeedbackForm onSend={sendChat} />
      </div> */}
    </div>
  );
};

export default ChatPage;