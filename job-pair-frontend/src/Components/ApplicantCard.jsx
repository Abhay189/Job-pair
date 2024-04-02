import React from 'react'
import { useState } from 'react';
import '../Styles/applicantcard.css'
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
function ApplicantCard({ applicant }) {
  const [isStarFilled, setIsStarFilled] = useState(false);

  const chatNow = () => {
    console.log('Chat Now')

  }
  const sendInterview = () => {
    console.log('Interview Sent')

  }
  return (
    <>
      <div className='applicant-card-div'>
        <div className='applicant-top-row'>
          <div className='applicant-top-row-cell'>
            <div className='applicant-info-box'>
              {applicant.name}
            </div>
            <div className='applicant-info-box'>
              GPA: {applicant.GPA}
            </div>
            <div className='applicant-info-box'>
              {applicant.university}
            </div>

          </div>
          <div className='applicant-top-row-cell'>
            <div className='applicant-info-box'>
              Match Score: {applicant.matchScore}%
            </div>
            <Button variant="link" onClick={() => setIsStarFilled(!isStarFilled)} style={{ color: isStarFilled ? '#FFD700' : '' }}>
              <FontAwesomeIcon icon={isStarFilled ? fasStar : farStar} />
            </Button>
          </div>
        </div>
        <div className='applicant-bottom-row'>
          <div className='applicant-summary-box'>
            {applicant.career_aspirations}
          </div>
          <div className='applicant-buttons-column'>
            <Button size="sm" variant="primary" onClick={sendInterview} >
              Send Interview
            </Button>
            <Button size="sm" variant="primary" onClick={chatNow}>
              Chat Now
            </Button>

          </div>

        </div>

      </div>
      <div className='applicant-mobile-applicant-wrapper'>
        <div className='applicant-card-div-mobile'>
          <div className='applicant-mobile-row'>
            <div className='applicant-mobile-row-info'>
              <div className='applicant-mobile-row-name'>
                {applicant.name}
              </div>

              <Button variant="link" onClick={() => setIsStarFilled(!isStarFilled)} style={{ color: isStarFilled ? '#FFD700' : '' }}>
                <FontAwesomeIcon icon={isStarFilled ? fasStar : farStar} />
              </Button>

            </div>
            <div className='applicant-mobile-row-info'>
              <div className='applicant-info-box'>
                GPA: {applicant.GPA}
              </div>
              <div className='applicant-info-box'>
                {applicant.institution}
              </div>
            </div>
          </div>
          <div className='applicant-mobile-row'>
            <div className='applicant-summary-box'>
              {applicant.bio}
            </div>
          </div>

        </div>
        <div className='applicant-buttons-column'>
          <Button size="lg" variant="primary" onClick={sendInterview} >
            Send Interview
          </Button>
          <Button size="lg" variant="primary" onClick={chatNow}>
            Chat Now
          </Button>

        </div>
      </div>
    </>
  )
}

export default ApplicantCard