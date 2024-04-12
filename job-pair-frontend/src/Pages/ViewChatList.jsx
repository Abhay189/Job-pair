import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatCard from '../Components/ChatCard';
import '../Styles/ChatList.css';
import { useNavigate } from "react-router-dom";

export default function ViewChatList() {
    let navigate = useNavigate();

    useEffect(()=> {
      const temp_id = localStorage.getItem('id');
  
      if (temp_id == null) {
          console.error('User not signed in, redirecting to login..');
          navigate('/');
      }
    },[]);

    const [chatList, setChatList] = useState([]);
    const baseUrl = 'http://127.0.0.1:5002'
    useEffect(() => {
        const fetchChats = async () => {
          try {
            const userId = localStorage.getItem('id'); 
            const userType = localStorage.getItem('userType');
            
            if (userType == 'admins') {
              const response = await axios.get('http://127.0.0.1:5002/get-chats-admin', { params: { user_id: userId,user_type:userType } });
              setChatList(response.data);
            }
            else{
              const response = await axios.get('http://127.0.0.1:5002/get-chats', { params: { user_id: userId,user_type:userType } });
              setChatList(response.data);
            }
              
          } catch (err) {
            console.error('Error fetching chats:', err);
          }
        };
    
        fetchChats();
      }, []); // The empty array ensures this effect runs only once after the initial render
    
      
  return (
    <div className='chat-list-container'>
        <h1>Conversations</h1>
        <div className='chat-card-list'>
        {chatList.map((chat) => (
            <ChatCard chat={chat} key={chat.id}/>
        ))}
        </div>




    </div>
  )
}
