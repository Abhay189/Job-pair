import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatCard from '../Components/ChatCard';
import '../Styles/ChatList.css';

export default function ViewChatList() {
    const [chatList, setChatList] = useState([]);
    const baseUrl = 'http://127.0.0.1:5000/'
    useEffect(() => {

        async function fetchData() {
            const params = {
                id: localStorage.getItem('id')
            }
            try{
            const response = await axios.get(baseUrl + '/get_chat_list', { params });
            setChatList(response.data);
            }
            catch (error) {
                setChatList([
                    {
                        id: 1,
                        sender: 'Sender',
                        date: '01/01/2021',
                        unreadMessages: 0,
                        lastMessage: 'Last message'
                    },
                    {
                        id: 2,
                        sender: 'Sender2',
                        date: '01/09/2021',
                        unreadMessages: 0,
                        lastMessage: 'Last message2'
                    }

                ]);
                console.error(error);
            }
        }

        fetchData();
        
        
    }, []);
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
