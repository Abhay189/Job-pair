import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatCard from '../Components/ChatCard';
import '../Styles/ChatList.css';

export default function ViewChatList() {
    const [chatList, setChatList] = useState([]);
    const baseUrl = 'http://127.0.0.1:5000'
    useEffect(() => {
        const fetchChats = async () => {
          try {
            const userId = localStorage.getItem('id'); 
            const userType = localStorage.getItem('userType');
            
    
            const response = await axios.get('http://127.0.0.1:5000/get-chats', { params: { user_id: userId,user_type:userType } });
            setChatList(response.data);
          } catch (err) {
            console.error('Error fetching chats:', err);
          }
        };
    
        fetchChats();
      }, []); // The empty array ensures this effect runs only once after the initial render
    
      
  return (
    <div>
        <h1 className='chat-list-header'>Conversations</h1>
        <div className='chat-card-list'>
        {chatList.map((chat) => (
            <ChatCard chat={chat} key={chat.id}/>
        ))}
        </div>




    </div>
  )
}
