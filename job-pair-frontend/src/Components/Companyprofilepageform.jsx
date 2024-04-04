import React, { useEffect } from 'react'
import { useState } from 'react';
import { Alert } from 'react-bootstrap';

import { Form, Button, Modal } from 'react-bootstrap';
import '../Styles/profilepage.css';
import axios from 'axios';
export function Companyprofilepageform({company}) {

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

const defaultImageUrl = process.env.PUBLIC_URL + '/defaultprofile.jpg';
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#D9D9D9',
    }),
  };

  useEffect(() => {
    const fetchData = async () => {
    setFormInput({
      phoneNumber: company.phoneNumber || '',
      name: company.name || '',
      email: company.email || '',
      password: '',
      location: company.location || '',
      description: company.description || '',
    });
  };
  fetchData();
  }, [company]);


  useEffect(() => {
    const fetchUserData = async () => {
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('id');
      const url = 'http://127.0.0.1:5000/get_user';

      try {
        setError (false);
        setSuccess(false);
        const response = await axios.post(url, { userType: userType, id: userId });
        const user = response.data;
        const mapData =  {
          phoneNumber: user.phoneNumber || '',
          name: user.name || '',
          email: user.email|| '',
          password: '',
          location: user.location || '',
          companyDescription: user.companyDescription || '',
        }
        setFormInput(mapData);
     
      } catch (error) {
        console.log(error.response ? error.response.data : error.message)
        setError(true);
      }
    };

    fetchUserData();
  }, []);


    const [formInput, setFormInput] = useState({
      phoneNumber: company.phoneNumber || '',
      name: company.name || '',
      email: company.email || '',
      password: '',
      location: company.location || '',
      description: company.description || '',
    });
  
    const [selectedImage, setSelectedImage] = useState(null);

   
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormInput({
        ...formInput,
        [name]: value
      });
    };
  
    const handleSubmit = async (e) => {

      setError(false);
      setSuccess(false);
      
      e.preventDefault();
      try {
        const formData = {
          id: localStorage.getItem('id'),
          userType: localStorage.getItem('userType'),
          updatedData:
          {...formInput}
        }
        const url = 'http://127.0.0.1:5000/update_user_profile';
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'application/json'
          }
       
        });
    
        console.log(response.data); 
        
        setSuccess(true);
        setError(false);
      } catch (error) {
        console.error(error.response ? error.response.data : error.message); 
        setError(true);
        setSuccess(false);
      }
    }

  const [showFileSelect, setShowFileSelect] = useState(false);

  const handleCloseFileModal = () => setShowFileSelect(false);
  const handleShowFileModal = () => setShowFileSelect(true);


    const handleChangeImage = (e) => {
      const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }

    }

    const imageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormInput({
            ...formInput,
            image: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <div className='form-container'>




      <div className='written-form'>
       
      <Form id="userform" onSubmit={handleSubmit}>
      <Form.Group className='mb-2' controlId="formName">
      {success && <Alert variant="success">Create/Edit successful!</Alert>}
    {error && <Alert variant="danger">An error occurred!</Alert>}
          <div><Form.Label>Name</Form.Label></div>
          <Form.Control
            type="text"
            name="name"
            value={formInput.name}
            onChange={handleChange}
            placeholder="Name"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formEmail">
        <div> <Form.Label>Email</Form.Label></div> 
          <Form.Control
            type="email"
            name="email"
            value={formInput.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formPhoneNumber">
       <div>  <Form.Label>Phone Number</Form.Label> </div> 
          <Form.Control
            type="tel"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            name="phoneNumber"
            value={formInput.phoneNumber}
            onChange={handleChange}
            placeholder="123-456-7890"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formPassword">
         <div> <Form.Label>Password</Form.Label> </div>
          <Form.Control
            type="password"
            name="password"
            value={formInput.password}
            onChange={handleChange}
            placeholder="********"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formLocation">
          <div><Form.Label>Location</Form.Label></div>
          <Form.Control
            type="text"
            name="location"
            value={formInput.location}
            onChange={handleChange}
            placeholder="Location"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formCompanyDescription">
          <div><Form.Label>Company Description</Form.Label></div>
          <Form.Control
            type="text"
            name="companyDescription"
            value={formInput.companyDescription}
            onChange={handleChange}
            placeholder="Describe your company here..."
            as="textarea" rows={3}
          />
        </Form.Group>
        
      <Button id='small-screen-button' form='userform' className='mt-5' size="lg" variant="primary" type="submit">
          Update
        </Button>
        

       
      </Form>
      
      </div>
      <div className='image-form'>

        <div className='circle-image'>
        <img src={defaultImageUrl} alt='Profile' />


        </div>

        <p className='change-image' onClick={handleShowFileModal}>Change Image</p>


        <Modal show={showFileSelect} onHide={handleCloseFileModal}>
        <Modal.Header closeButton>
          <Modal.Title>Select an Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="file" onChange={imageUpload} accept="image/*" />
          {selectedImage && (
            <div className="mt-3">
              <img src={selectedImage} alt="Selected" style={{ width: "100%" }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFileModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>





      <Button id='large-screen-button' form='userform' className='mt-5 ' size="lg" variant="primary" type="submit">
          Update
        </Button>

        </div>
      </div>
    );
  }