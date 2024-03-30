import requests

# URL of the Flask app
url = "http://localhost:5000/update_job_answer"

# Send a GET request
response = requests.post(url, json={
    'user_id' : 1,
    'job_id' :"12",
    'updated_answer': "hello this is a new answer",
    'index' : 1

})

# Check if the request was successful
if response.status_code == 200:
    print("Response from the server:", response.text)
else:
    print("Failed to get a response from the server", response.status_code)