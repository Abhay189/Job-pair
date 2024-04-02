import React, { useState, useEffect } from 'react';
import {Message} from '../Components/Message';
import axios from 'axios';  // Import axios
import '../Styles/ChatPage.css';
import { SendMessageForm } from '../Components/SendMessageForm';

import { Button } from 'react-bootstrap';
const baseUrl = 'http://127.0.0.1:5000/';



const ChatPage = ({ onBack, selectedMessages,threadIndex,otherUsername }) => {
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState('');

  const [userType, setUserType] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  

  useEffect(() => {

    const id = localStorage.getItem('id');
    const userType = localStorage.getItem('userType');

    if (id) {
      setId(id);
    } else {
      console.error("Username not found in local storage");
    }
    if (setUserType) {
      setUserType(userType);
    } else {
      console.error("User Role not found in local storage");
    }


    if (Array.isArray(selectedMessages) && selectedMessages.length > 0) {
      const initialMessages = selectedMessages.map(msg => ({
        text: msg.message,
        date: msg.date,
        time: msg.time,
        isUser: msg.sender === id 
      }));
      setMessages(initialMessages);
    }
  }, [selectedMessages, id, userType]);

  

  const sendChat = async (chatMessage) => {
    if (chatMessage.trim() !== '') {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString(); // Format as 'MM/DD/YYYY'
      const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format as 'HH:MM AM/PM'

      setMessages(prevMessages => [...prevMessages, { text: chatMessage, date: formattedDate, time: formattedTime, isUser: true }]);
      
      try {
        const response = await axios.post(baseUrl +'/add_message', {
          username: id,
          index: threadIndex,
          message: chatMessage,
          sender: id
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
        <h1>Chat with {otherUsername}</h1>
      </div>
      <div className="top-right">
  
      </div>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} date={msg.date} time={msg.time} isUser={msg.isUser} />
        ))}
      </div>
          <SendMessageForm sendChat={sendChat} />
     
    </div>
  );
};

export default ChatPage;