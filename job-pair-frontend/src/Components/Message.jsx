import React from 'react'

export function Message ({ text, date, time, isUser }) {
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
  

