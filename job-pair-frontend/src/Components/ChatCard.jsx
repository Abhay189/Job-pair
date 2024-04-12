import React, { useEffect, useState } from 'react';
import '../Styles/ChatCard.css';
import { useNavigate } from 'react-router-dom';
import { Badge, FormCheck, Button } from 'react-bootstrap';
import axios from 'axios';

export default function ChatCard({ chat }) {
  const navigate = useNavigate();
  const [flagged, setFlagged] = useState(chat.flagged || false);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    setUserType(userType);
    setFlagged(chat.flagged || false);
  }, []);

  const handleViewChat = () => {
    navigate('/chat/' + chat.id);
  };

  const handleFlagChange = async (event) => {
    if (userType === 'admins') {
      setFlagged(event.target.checked);
      try {
        const response = await axios.post(`http://127.0.0.1:5000/flagChat`, {
          chatId: chat.id,
          flagged: event.target.checked,
        });
        console.log('Flagging response:', response.data);
      } catch (error) {
        console.error('Error flagging chat:', error);
      }
    }
  };

  return (
    <>
      <div className='chat-card'>
        <div className='chat-card-top'>
          <div>
            <div className='chat-card-top-info'>
              {chat.sender} <Badge bg="danger">{chat.unreadMessages}</Badge>
            
            </div>
            <div>
            {userType === 'admins' && (
                <FormCheck
                  type="checkbox"
                  checked={flagged}
                  onChange={handleFlagChange}
                  label="Flag chat"
                  className='flag-checkbox'
                />
              )}
            </div>
          </div>
          <div>
            <div className='chat-card-top-right'>
              <div className='chat-card-top-info'>
                {chat.date}
              </div>
            </div>
          </div>
        </div>

        <div className='chat-card-bottom'>
          {chat.lastMessage}
        </div>
        <Button onClick={handleViewChat} variant="primary">View Chat</Button>
      </div>
      <div className="chat-card-mobile">
        <div className='chat-card-top'>
          <div>
            <p className='mobile-sender'>
              {chat.sender} <Badge bg="danger">{chat.unreadMessages}</Badge>
              {userType === 'admins' && (
                <FormCheck
                  type="checkbox"
                  checked={flagged}
                  onChange={handleFlagChange}
                  label="Flag chat"
                />
              )}
            </p>
          </div>
          <div>
            <p>{chat.date}</p>
          </div>
        </div>

        <div className='chat-card-bottom'>
          <p>{chat.lastMessage} </p>
        </div>
        <Button onClick={handleViewChat} variant="primary">View Chat</Button>
      </div>
    </>
  );
}
