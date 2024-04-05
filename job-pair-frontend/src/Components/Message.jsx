import React from 'react'

export function Message ({ text, date, time, isUser }) {
    const messageClass = !isUser ? 'user' : 'other';
    console.log('Message:', text, date, time, isUser);
    return (
      <div className={`message ${messageClass}`}>
        
        
        <div className="message-text">{text}</div>
        <div className="message-footer">
        <div className="message-time">{date}</div>
          <div className="message-time">{time}</div>
        </div>
      </div>
    );
  };
  

