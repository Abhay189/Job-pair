import React from 'react';
import { styles } from "../Styles/InterviewPage"
import "../Styles/interviewPage.css";

class InterviewPage extends React.Component {
  constructor(props) {
    super(props);
    
    // Refs for video elements
    this.videoLive = React.createRef();
    this.videoRecorded = React.createRef();

    // Binding methods to 'this' context
    this.initVideoStream = this.initVideoStream.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.uploadVideo = this.uploadVideo.bind(this);

    // Initialize state
    this.state = {
        isRecording: false,            // To track if recording is in progress
        isUploadButtonVisible: false,  // To control the visibility of the upload button
        aiFeedback: '',                // To store AI feedback
        error: null,                   // To handle any errors
        stream: null,                  // To store the media stream
        mediaRecorder: null,           // To reference the MediaRecorder instance
        recordedChunks: [],            // To store the recorded video chunks
        remainingTime: 120,
        timerActive: false,
        showAiFeedback: false          // To control the display of AI feedback
    };
}


  componentDidMount() {
      this.initVideoStream();
  }

  initVideoStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // Use the ref to set the stream to the video element
        if (this.videoLive.current) {
            this.videoLive.current.srcObject = stream;
        }

        // Update the component's state, e.g., to indicate that the stream is ready
        this.setState({
            isStreamReady: true,
            error: null
        });

        return stream;
    } catch (error) {
        console.error("Error accessing media devices:", error);
        
        // Update the component's state to handle the error
        this.setState({
            isStreamReady: false,
            error: error.message // Storing the error message in the state
        });

        return null;
    }
}


startRecording = async () => {
  try {
    let stream = this.state.stream;
    this.setState({ timerActive: true });
    this.timerInterval = setInterval(() => {
        this.setState(prevState => {
            if (prevState.remainingTime > 0) {
                return { remainingTime: prevState.remainingTime - 1 };
            } else {
                clearInterval(this.timerInterval);
                return { remainingTime: 0, timerActive: false };
            }
        });
    }, 1000);
    // Check if the stream is not already active
    if (!stream || stream.getTracks().every(track => track.readyState === 'ended')) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        this.setState({ stream });
    }

    if (this.videoLive.current) {
        this.videoLive.current.srcObject = stream;
        this.videoLive.current.style.display = 'block'; // Ensure the live feed is visible
    }

    // Initialize MediaRecorder with the stream
    const mediaRecorder = new MediaRecorder(this.state.stream);
    let recordedChunks = [];

      // Event handler for when data is available
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            console.log('Chunk added: ', event.data); // Add this line
        }
    };
    

      // Event handler for when recording stops
      mediaRecorder.onstop = () => {
          const videoBlob = new Blob(recordedChunks, { type: "video/mp4" });
          const videoURL = URL.createObjectURL(videoBlob);
          if (this.videoRecorded.current) {
              this.videoRecorded.current.src = videoURL;
              this.videoRecorded.current.style.display = "block";
          }
          this.setState({ recordedChunks }); // Save the blob directly in the state

      };

      // Start recording
      mediaRecorder.start();

      // Update component state
      this.setState({
          mediaRecorder,
          isRecording: true,
          isUploadButtonVisible: false
      });
  } catch (error) {
      console.error("Error starting recording:", error);
      this.setState({ error: error.message });
  }
};


stopRecording = () => {
  // Check if the mediaRecorder is currently recording
  if (this.state.mediaRecorder && this.state.mediaRecorder.state === "recording") {
      // Stop the media recorder
      this.state.mediaRecorder.stop();

      // Stop all media tracks in the stream
      if (this.state.stream) {
          this.state.stream.getTracks().forEach(track => track.stop());
      }

      // Update component state to reflect changes
      this.setState({
          isRecording: false,
          isUploadButtonVisible: true,
          // Do not clear the stream here; keep it for reuse
      });

      clearInterval(this.timerInterval);
    this.setState({ timerActive: false, remainingTime: 120 }); // Reset timer
      // If using refs to manage DOM elements
      if (this.videoLive.current) {
          this.videoLive.current.srcObject = null;
          this.videoLive.current.style.display = 'none';
      }
  }
};

uploadVideo = () => {
  // Assuming 'recordedChunks' is stored in the component's state
  const videoBlob = new Blob(this.state.recordedChunks, { type: "video/mp4" });
  const formData = new FormData();
  formData.append("video", videoBlob, "interview.mp4");

  for (var pair of formData.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
    if (pair[1] instanceof Blob) {
    }
}

  // Fetch API call
  fetch('http://localhost:5000/upload_video', {
    method: 'POST',
    body: formData
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Upload successful', data);
    console.log('Checking AI feedback:', data.ai_feedback); 

    if (data.ai_feedback) {
        console.log('Displaying AI feedback');
        this.setState({
            aiFeedback: data.ai_feedback,
            showAiFeedback: true
        });
    } else {
        console.log('No AI feedback found');
        this.setState({
            aiFeedback: '',
            showAiFeedback: false
        });
    }this.setState({
        recordedChunks: [],
    });
})

.catch(error => {
    console.error('Error in upload:', error);
    this.setState({
        error: error.message,
        showAiFeedback: false
    });
});
};

render() {
    const { isRecording, isUploadButtonVisible, aiFeedback, showAiFeedback, remainingTime, timerActive } = this.state;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    return (
      <div className="interview-container">
        {/* Left Section: Question Pane and Answer Section */}
        <div className="interview-section">
          <h1 className="heroHeadText">Interview Prep</h1>
          <p className="sectionHeadText">Here is your interview question!</p>
          <div className="question-box">
            <p><strong>Question: Tell us about the biggest challenge you've ever faced</strong></p>
          </div>
          {showAiFeedback && (
            <div className="answer-section">
              <p><strong>AI Feedback:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: aiFeedback }} />
            </div>
          )}
        </div>

        {/* Right Section: Video Container and Time Indicator */}
        <div className="interview-section">
          <div className="video-container">
            <div className="video-box">
              <video autoPlay muted playsInline ref={this.videoLive}></video>
              <video controls playsInline ref={this.videoRecorded} style={{ display: 'none' }}></video>
            </div>

            {/* Controls */}
            <div className="controls">
              {!isRecording && (
                <button className="video-button" onClick={this.startRecording}>
                  Start Recording
                </button>
              )}
              {isRecording && (
                <button className="video-button" onClick={this.stopRecording}>
                  Stop Recording
                </button>
              )}
              {isUploadButtonVisible && (
                <button className="video-button" onClick={this.uploadVideo}>
                  Submit Video
                </button>
              )}
            </div>
          </div>

          <div className="timer">
            Time Limit: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        </div>
      </div>
    );
  }
}

export default InterviewPage;
