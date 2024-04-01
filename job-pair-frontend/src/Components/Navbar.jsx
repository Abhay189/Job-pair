import React, { useState } from 'react';
import { Link } from "react-router-dom";
import '../Styles/Navbar.css'; // Make sure to create a corresponding CSS file
import logo from '../Assets/Job-pair-small 1.png'; // Import the image here

const Navbar = () => {
    const [active, setActive] = useState('jobs'); // Default active is 'jobs'

    const handleToggle = (buttonId) => {
        setActive(buttonId);

    };

    const buttons = [
        { id: 'viewJobs', text: 'Jobs' },
        { id: 'interview', text: 'Interview' },
        { id: 'tracking', text: 'Tracking' },
        { id: 'userprofile', text: 'Profile' },
        { id: 'chat', text: 'Chat' }
    ];
    return (
        <nav className="navbar">
        <img src={logo} alt='Brand logo' />
        <div className="menu">
            <div className='menu-options'>
            {buttons.map((button) => (
                <Link 
                    key={button.id}
                    to={'/'+button.id}
                    className={`toggle-button ${active === button.id ? 'active' : ''}`}
                    onClick={() => handleToggle(button.id)}
                >
                    {button.text}
                </Link>
            ))}
            </div>
            <a className="logout-button" href="/logout">Logout</a>
        </div>
        
        <div className="menu-icon">
            {/* Icon to show/hide the menu on small screens */}
        </div>
        </nav>
    );
};

export default Navbar;