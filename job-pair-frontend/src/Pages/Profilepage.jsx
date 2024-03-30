import React from 'react'
import { Profilepageform } from  '../Components/Profilepageform.jsx';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
export default function Profilepage() {
  const { id } = useParams();
  const [user, setUser] = useState({
    techSkills: [],
    expectedsalary: '',
    phoneNumber: '',
    name: '',
    emailAddress: '',
    preferredJobTitle: '',
    university: '',

  });
  useEffect(() => {
    setUser({
      techSkills: ['Java', 'CSS'],
      expectedsalary: '100000',
      phoneNumber: '1234567890',
      name: 'John Doe',
      emailAddress: 'john@email.com',
      preferredJobTitle: 'Software Engineer',
      password: '',
      university: 'University of Waterloo',
      
    });
  }, [id]);
  return (
    <div className='main-container'>
        <div className='profile-container'>
            <h1>Profile</h1>
            <Profilepageform user={user}/>
        </div>

    </div>
  )
}
