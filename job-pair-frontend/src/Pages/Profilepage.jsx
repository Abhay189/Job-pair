import React from 'react'
import { Profilepageform } from  '../Components/Profilepageform.jsx';
import { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';


export default function Profilepage() {

  let navigate = useNavigate();

  useEffect(()=> {
    const temp_id = localStorage.getItem('id');

    if (temp_id == null) {
        console.error('User not signed in, redirecting to login..');
        navigate('/');
    }
  },[]);

  
  const { id } = useParams();
  const [user, setUser] = useState({
    techSkills: [],
    expectedsalary: '',
    phoneNumber: '',
    name: '',
    email: '',
    preferredJobTitle: '',
    pronouns: [],
    gender: '',
    university: '',

  });
  
  useEffect(() => {
    setUser({
      techSkills: ['Java', 'CSS'],
      expectedsalary: '100000',
      phoneNumber: '1234567890',
      name: 'John Doe',
      email: 'john@email.com',
      preferredJobTitle: 'Software Engineer',
      password: '',
      university: 'University of Waterloo',
      

      pronouns: [{ value: 'he/him', label: 'he/him' }], // Assuming pronouns are stored in a similar format as techSkills
      gender: 'Male', // Example gender
    });
  }, [id]);
  return (
    <div className='main-container'>
      <h1>Profile</h1>
        <div className='profile-container'>
            <Profilepageform user={user}/>
        </div>

    </div>
  )
}
