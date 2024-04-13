import React from 'react'
import  { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import '../Styles/SendMessageForm.css';
export function SendMessageForm ({ sendMessage }) {
    const [chatMessage, setChatMessage] = useState('');

    const handleInputChange = (event) => {
        setChatMessage(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendChat(chatMessage);
        setChatMessage('');
    };

    const sendChat = (message) => {
        sendMessage(message);
    };
    return (
      <Form onSubmit={handleSubmit} className='send-message-container'>
      <Form.Group className='message-container' controlId="chatMessage">
        
        <Form.Control
          as="textarea"
          name="chatMessage"
          value={chatMessage}
          onChange={handleInputChange}
          placeholder="message"
        />
      </Form.Group>
      <Button variant="primary" type="submit" className='chat-button'>
        Send
      </Button>
      </Form>
    );
  };
  
