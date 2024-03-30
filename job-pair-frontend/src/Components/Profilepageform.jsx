import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Button, Col,Modal } from 'react-bootstrap';
import Select from 'react-select';
import '../Styles/profilepage.css';
import axios from 'axios';
export function Profilepageform({user}) {
// default profile picure taken from https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg
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
      techSkills: user.techSkills.map(item => ({ value: item, label: item })) || [],
      expectedsalary: user.expectedsalary || '',
      phoneNumber: user.phoneNumber || '',
      name: user.name || '',
      emailAddress: user.emailAddress || '',
      password: '',
      preferredJobTitle: user.preferredJobTitle || '',
      university: user.university || '',
    });
  };
  fetchData();
  }, [user]);
    const [formInput, setFormInput] = useState({
      techSkills: user.techSkills.map(item => ({ value: item, label: item })) || [],
      expectedsalary: user.expectedsalary || '',
      phoneNumber: user.phoneNumber || '',
      name: user.name || '',
      emailAddress: user.emailAddress || '',
      password: '',
      preferredJobTitle: user.preferredJobTitle || '',
      university: user.university || '',
    });


    
  
  
    const [selectedImage, setSelectedImage] = useState(null);

    const techSkillOptions = [
      { value: 'Java', label: 'Java' },
      { value: 'CSS', label: 'CSS' },
      { value: 'HTML', label: 'HTML' },
    ];
  
    const handleTechSkillChange = (selectedOptions) => {
      setFormInput({
        ...formInput,
        techSkills: selectedOptions || []
      });
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormInput({
        ...formInput,
        [name]: value
      });
    };
  
    const handleSubmit = async (e) => {
      
      e.preventDefault();
      try {
        const formData = {
          id: localStorage.getItem('id'),
          ...formInput
        }
        const response = await axios.post('/update_user_profile', formData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        console.log(response.data); 
      } catch (error) {
        console.error(error.response ? error.response.data : error.message); 
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
        <div> <Form.Label>Email Address</Form.Label></div> 
          <Form.Control
            type="email"
            name="email"
            value={formInput.emailAddress}
            onChange={handleChange}
            placeholder="Email Address"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formPassword">
         <div> <Form.Label>Password</Form.Label> </div>
          <Form.Control
            type="password"
            name="password"
            value={formInput.password}
            onChange={handleChange}
            placeholder=""
          />
        </Form.Group>
        <Form.Group className='mb-2' controlId="formTechSkills">
        <div> <Form.Label>Tech Skills</Form.Label> </div> 
          <Select
            isMulti
            value={formInput.techSkills}
            styles={selectStyles} 
            options={techSkillOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={handleTechSkillChange}
            name="multiSelect"
          />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formName">
          <div><Form.Label>University</Form.Label></div>
          <Form.Control
            type="text"
            name="university"
            value={formInput.university}
            onChange={handleChange}
            placeholder="university"
          />
        </Form.Group>

        
  
        <Form.Group className='mb-2' controlId="formMoneyInput">
        <div> <Form.Label>Expected Salary($)</Form.Label> </div> 
          <Form.Control
            type="number"
            name="moneyInput"
            value={formInput.expectedsalary}
            onChange={handleChange}
            placeholder="Enter amount"
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