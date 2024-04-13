import React, { useState, useEffect } from 'react';
import { Message } from '../Components/Message';
import axios from 'axios'; // Import axios
import { SendMessageForm } from '../Components/SendMessageForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Form } from 'react-bootstrap'; // Import Modal and Form components from react-bootstrap
import { BiFlag } from 'react-icons/bi'; // Import flag icon from react-icons
import '../Styles/ChatPage.css';
const baseUrl = 'http://127.0.0.1:5002';

const ChatPage = () => {
  let navigate = useNavigate();

  useEffect(() => {
    const temp_id = localStorage.getItem('id');

    if (temp_id == null) {
      console.error('User not signed in, redirecting to login..');
      navigate('/');
    }
  }, []);

  const [messages, setMessages] = useState([]);
  let { id } = useParams();

  const [otherUsername, setOtherUsername] = useState('Test user');

  const [showFlagModal, setShowFlagModal] = useState(false); // State variable for flag modal visibility
  const handleCloseFlagModal = () => setShowFlagModal(false); // Function to close flag modal
  const handleShowFlagModal = () => setShowFlagModal(true); // Function to show flag modal

  const [userType, setUserType] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const userId = localStorage.getItem('id');
      const userType = localStorage.getItem('userType');

      try {
        if (userType === 'admins') {
          const response = await axios.get(baseUrl + '/get-messages', {
            params: { user_id: userId, chat_id: id },
          });
        }
        const response = await axios.get(baseUrl + '/get-messages', {
          params: { user_id: userId, chat_id: id },
        });

        console.log('Messages:', response.data);
        const received = response.data.messages.map((msg) => ({
          text: msg.message,
          date: msg.date,
          time: msg.time,
          isUser: msg.sender_id == userId,
        }));
        console.log('Received messages:', received);
        setMessages(received);
        if (userType === 'seekers') {
          setOtherUsername(response.data.recruiterName);
        } else if (userType === 'recruiters') {
          setOtherUsername(response.data.seekerName);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);

        const selectedMessages = [
          {
            id: 1,
            sender: 1,
            date: '01/01/2021',
            time: '12:00 PM',
            text: 'message1',
            isUser: true,
          },
          {
            id: 2,
            sender: 56,
            date: '01/09/2021',
            time: '12:00 PM',
            unreadMessages: 0,
            text: 'message2',
            isUser: false,
          },
          {
            id: 3,
            sender: 1,
            date: '01/09/2021',
            time: '12:00 PM',
            unreadMessages: 0,
            text: 'message3',
            isUser: true,
          },
        ];
        const initialMessages = selectedMessages.map((msg) => ({
          text: msg.text,
          date: msg.date,
          time: msg.time,
          isUser: msg.sender_id == userId,
        }));
        setMessages(initialMessages);
      }
    };
    fetchMessages();
  }, []);

  const sendChat = async (chatMessage) => {
    if (chatMessage.trim() !== '') {
      const userId = localStorage.getItem('id');
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString(); // Format as 'MM/DD/YYYY'
      const formattedTime = currentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }); // Format as 'HH:MM AM/PM'

      try {
        const response = await axios.post(baseUrl + '/add-message', {
          chat_id: id,
          message: chatMessage,
          sender_id: userId,
          date: formattedDate,
          time: formattedTime,
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: chatMessage, date: formattedDate, time: formattedTime, isUser: true },
        ]);
        console.log('Message sent to server:', response.data);
      } catch (error) {
        console.error('Error sending message to server:', error);
      }
    }
  };

  const [flagReason, setFlagReason] = useState(''); // State variable for flag reason



  const handleFlagConversation = () => {
    handleShowFlagModal(); // Show the flag modal when flag button is clicked
  };
  
  const handleFlagSubmit = async () => {
    try {
      // Send flag request to the backend
      const response = await axios.post(baseUrl + '/flagChat', {
        chatId: id,
        flagged: true, // Flag the conversation
        flagged_reason: flagReason // Pass the flag reason to the backend
      });
      console.log(response.data); // Log the response from the backend
      setShowFlagModal(false); // Close the flag modal after successful flagging
    } catch (error) {
      console.error('Error flagging conversation:', error); // Log error if flagging fails
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <div style={{ display: 'flex', gap: '20px' ,alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h1 style={{ margin: 0 }}> 
            <span style={{ margin: '0 auto' }}>{otherUsername}</span> 
          </h1>
          
          <Button variant="link" onClick={handleFlagConversation} className="flag-button">
            <BiFlag size={60} />
          </Button>
        </div>
      </div>
      <div className="top-right"></div>

      <div className="messages-list">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} date={msg.date} time={msg.time} isUser={msg.isUser} />
        ))}
      </div>

      <SendMessageForm sendMessage={sendChat} />

      <Modal show={showFlagModal} onHide={handleCloseFlagModal}>
        <Modal.Header closeButton>
          <Modal.Title>Flag Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="flagReason">
              <Form.Label>Reason for flagging:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)} // Update flag reason when user inputs it
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFlagModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleFlagSubmit}>
            Flag
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatPage;
