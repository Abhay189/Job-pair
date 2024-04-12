import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Button, Col,Modal } from 'react-bootstrap';
import Select from 'react-select';
import '../Styles/profilepage.css';
import axios from 'axios';
import { Alert } from 'react-bootstrap';

export function Profilepageform({user}) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
// default profile picure taken from https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg
const defaultImageUrl = process.env.PUBLIC_URL + '/defaultprofile.jpg';
const [formInput, setFormInput] = useState({
  techSkills: user?.techSkills.map(item => ({ value: item, label: item })) || [],
  pronouns: user?.pronouns.map(item => ({ value: item, label: item })) || [],
  expectedSalary: user?.expectedSalary || '',
  phoneNumber: user.phoneNumber || '',
  name: user.name || '',
  email: user.email || '',
  password: '',
  preferredJobTitle: user.preferredJobTitle || '',
  university: user.university || '',
  gender: '',
  location: user.location || '',
  bio: user.bio || ''
});
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#D9D9D9',
    }),
  };


  useEffect(() => {
    const fetchUserData = async () => {
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('id');
      const url = 'http://127.0.0.1:5002/get_user';

      try {
        setError (false);
        setSuccess(false);
        const response = await axios.post(url, { userType: userType, id: userId });
        const user = response.data;
        const mapData =  {
          techSkills: user.techSkills ? user?.techSkills.map(item => ({ value: item, label: item })) : [],
          pronouns: user.pronouns ? user?.pronouns.map(item => ({ value: item, label: item })) : [],
          gender: user.gender || '',
          expectedSalary: user.expectedSalary || '',
          phoneNumber: user.phoneNumber || '',
          name: user.name || '',
          email: user.email || '',
          password: '',
          preferredJobTitle: user.preferredJobTitle || '',
          location: user.location || '',
          bio: user.bio || '',
          university: user.institution || '',
        }
        setFormInput(mapData);
     
      } catch (error) {
        console.log(error.response ? error.response.data : error.message)
        setError(true);
      }
    };

    fetchUserData();
  }, []);

    
  
  
    const [selectedImage, setSelectedImage] = useState(null);

    const techSkillOptions = [
      { value: 'Java', label: 'Java' },
      { value: 'CSS', label: 'CSS' },
      { value: 'HTML', label: 'HTML' },
    ];

    const pronounOptions = [
      { value: 'he/him', label: 'he/him' },
      { value: 'she/her', label: 'she/her' },
      { value: 'they/them', label: 'they/them' },
      { value: 'other', label: 'Other' },
    ];

    const genderOptions = [
      "Male",
      "Female",
      "Non-binary",
      "Prefer not to say",
      "Other"
    ];

    const handlePronounsChange = (selectedOptions) => {
      setFormInput({
        ...formInput,
        pronouns: selectedOptions || []
      });
    };
  
    const handleTechSkillChange = (selectedOptions) => {
      setFormInput({
        ...formInput,
        techSkills: selectedOptions || []
      });
    };

    const handleGenderChange = (e) => {
      const { name, value } = e.target;
      setFormInput({
        ...formInput,
        [name]: value
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

        setError(false);
        setSuccess(false);
        
        const formatInput = {
          ...formInput,
          pronouns: formInput.pronouns.map(item => item.value),
          techSkills: formInput.techSkills.map(item => item.value)
        }

        const formData = {
          id: localStorage.getItem('id'),
          userType: localStorage.getItem('userType'),
          updatedData:
          {...formatInput}
        }
        const url = 'http://127.0.0.1:5002/update_user_profile';
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'application/json'
          }
       
        });
    
        setError(false);
        setSuccess(true);
      } catch (error) {
        setError(true);
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
      {success && <Alert variant="success">Create/Edit successful!</Alert>}
    {error && <Alert variant="danger">An error occurred!</Alert>}
       
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

        <Form.Group className='mb-2' controlId="formPronouns">
            <div><Form.Label>Pronouns</Form.Label></div>
            <Select
              isMulti
              value={formInput.pronouns}
              styles={selectStyles}
              options={pronounOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handlePronounsChange}
              name="pronouns"
            />
        </Form.Group>

        <Form.Group className='mb-2' controlId="formGender">
            <div><Form.Label>Gender</Form.Label></div>
            <Form.Control as="select" name="gender" value={formInput.gender} onChange={handleChange}>
              {genderOptions.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </Form.Control>
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
            name="techSkills"
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
            name="expectedSalary"
            value={formInput.expectedSalary}
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

        <Form.Group className='mb-2' controlId="formLocation">
          <div><Form.Label>Current Location</Form.Label></div>
          <Form.Control
            type="text"
            name="location"
            value={formInput.location}
            onChange={handleChange}
            placeholder="Calgary, AB"
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId="formbio">
          <div><Form.Label>Bio</Form.Label></div>
          <Form.Control
            as="textarea"
            name="bio"
            value={formInput.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
            className='biotextarea' 
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