import React from 'react'
import { Companyprofilepageform } from '../Components/Companyprofilepageform'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Companyprofilepage() {
  const { id } = useParams();

  const [company, setCompany] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    setCompany({
      name: 'Company Name',
      email: 'weqweqe@email.com',
      phoneNumber: '1234567890',
      location: '1234 Some Street, Some City, Some State, 12345',
      companyDescription: 'This is a company description',
    });
  }, [id]);

  return (
    <div className='main-container'>
        <div className='profile-container'>
            <h1>Profile</h1>
            <Companyprofilepageform company={company}/>
        </div>

    </div>
  )
}
