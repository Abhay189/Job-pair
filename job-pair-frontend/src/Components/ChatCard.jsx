import React from 'react'
import '../Styles/ChatCard.css';
import { useNavigate } from 'react-router-dom';
import { Badge} from 'react-bootstrap';
export default function ChatCard({chat}) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/chats/' + chat.id);
    }



  return (
    <>
    <div onClick={handleClick} className='chat-card'>
        <div className='chat-card-top'>
            <div>
            <div className='chat-card-top-info'>
                {chat.sender}  <Badge bg="danger">{chat.unreadMessages}</Badge>
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

    </div>
    <div onClick={handleClick} className="chat-card-mobile">
        <div className='chat-card-top'>
            <div>
                <p className='mobile-sender'>{chat.sender} <Badge bg="danger">{chat.unreadMessages}</Badge></p>
            </div>
            <div>
                <p>{chat.date}</p>
                </div>
        </div>

        <div className='chat-card-bottom'>
            
               <p>{chat.lastMessage} </p>
           
            </div>
    </div>
    </>
  )
}
