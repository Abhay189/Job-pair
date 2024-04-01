import requests

# URL of the Flask app
url = "http://localhost:5000/update_user_profile"

# Send a GET request
# response = requests.get(url, params={
#     'usertype' : 'recruiters',
#     'id' : 1
# })

response = requests.post(url, json={
    'usertype': 'seekers',
    'id': 1,  # Assuming 'Ibrahim' is the unique identifier for this recruiter
    'updated_info': {
        'email': 'hulk@gmail.com',
        'fullName': 'Ibrahim',
        'password': '$2b$12$Rd.5retc.oI1fIXt.X9kyu6ee/ZaOdJBvytBGbPcVodOIxUYtLFf6',
    }
})

# Check if the request was successful
if response.status_code == 200:
    print("Response from the server:", response.text)
else:
    print("Failed to get a response from the server", response.text)