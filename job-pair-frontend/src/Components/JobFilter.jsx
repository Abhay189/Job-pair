import React from 'react';
import '../Styles/jobfilter.css';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
function Filter({ onFilterChange }) {
  const [show, setShow] = useState(false);
  return (

    <>

    <Button onClick={()=> {setShow(!show)} } className="filter-button">Show Filter </Button>
    <div className="filter-sidebar desktop">
      <div className="filter-header">
        Filter
      </div>
      <input
        className="filter-input"
        type="text"
        placeholder="Job Title"
        onChange={(e) => onFilterChange('title', e.target.value)}
      />
      <input
        className="filter-input"
        type="text"
        placeholder="Location"
        onChange={(e) => onFilterChange('location', e.target.value)}
      />
      <input
        className="filter-input"
        type="date"
        placeholder="Posting Date"
        onChange={(e) => onFilterChange('date', e.target.value)}
      />
    </div>
    {show &&
    <div className="filter-sidebar">
      <div className="filter-header">
        Filter
      </div>
      <input
        className="filter-input"
        type="text"
        placeholder="Job Title"
        onChange={(e) => onFilterChange('title', e.target.value)}
      />
      <input
        className="filter-input"
        type="text"
        placeholder="Location"
        onChange={(e) => onFilterChange('location', e.target.value)}
      />
      <input
        className="filter-input"
        type="date"
        placeholder="Posting Date"
        onChange={(e) => onFilterChange('date', e.target.value)}
      />
    </div>}
    </>

  );
}

export default Filter;
