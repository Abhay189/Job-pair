import React, { useState, useEffect } from 'react';
import {Message} from '../Components/Message';
import axios from 'axios';  // Import axios
import '../Styles/ChatPage.css';
import { SendMessageForm } from '../Components/SendMessageForm';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
const baseUrl = 'http://127.0.0.1:5000/';



const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  let { threadIndex } = useParams();
  
  const [otherUsername, setOtherUsername] = useState('Test user');



  const [userType, setUserType] = useState('');
  const [chatMessage, setChatMessage] = useState('');




  

  useEffect(() => {



    const fetchMessages = async () => {

    const id = localStorage.getItem('id');
    const userType = localStorage.getItem('userType');

    

    try{
    const response = await axios.get(baseUrl + '/get_messages', {
     params:{ username: id,
      index: threadIndex
     }
    });

    console.log('Messages:', response.data);
    response.data.map(msg => ({
      text: msg.message,
      date: msg.date,
      time: msg.time,
      isUser: msg.sender === id 
    }));
  }
  catch (error) {
    console.error('Error fetching messages:', error);
   

     const selectedMessages = [{
        id: 1,
        sender: 1,
        date: '01/01/2021',
        time: '12:00 PM',
        text: 'message1',
        isUser: true
    
      },
      {
        id: 2,
        sender: 56,
        date: '01/09/2021',
        time: '12:00 PM',
        unreadMessages: 0,
        text: 'message2',
        isUser: false
      },
      {
        id: 3,
        sender: 1,
        date: '01/09/2021',
        time: '12:00 PM',
        unreadMessages: 0,
        text: 'message3',
        isUser: true
      }
    
    ]
    console.log("user id is", id) 
      const initialMessages = selectedMessages.map(msg => ({
        text: msg.text,
        date: msg.date,
        time: msg.time,
        isUser: msg.sender == id
      }));
      setMessages(initialMessages);
    
  }

    
    }
    fetchMessages();
  }, []);

  

  const sendChat = async (chatMessage) => {
    if (chatMessage.trim() !== '') {
      const id = localStorage.getItem('id');
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