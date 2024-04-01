import requests

# URL of the Flask app for submitting an application
url = "http://localhost:5000/submit_application"

# Example application data to be submitted
application_data = {
    'id': 1,  # Use the actual seeker ID from your database
    'application_date': "2023-03-16",
    'application_response': [
        "Unfortunately, your portfolio did not meet our current needs.",
        "hello this is a new answer"
    ],
    'application_status': "in_progress",
    'company': "Adobe",
    'job_id': "12",
    'job_title': "UI/UX Designer"
}

# Send a POST request with the application data
response = requests.post(url, json=application_data)

# Check if the request was successful
if response.status_code == 200:
    print("Response from the server:", response.json())  # Using .json() for JSON response
else:
    print("Failed to get a response from the server", response.text)
