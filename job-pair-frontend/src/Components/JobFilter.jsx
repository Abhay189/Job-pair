import React from 'react';
import '../Styles/jobfilter.css';
import { Button } from 'react-bootstrap';
function Filter({ onFilterChange }) {
  return (
    <div className="filter-sidebar desktop">
      <div className="filter-header">
        Filters
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
      <Button>Search</Button>
    </div>
  );
}

export default Filter;