import threading
# from moviepy.editor import VideoFileClip, AudioFileClip
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
# from speechToText import transcribe_audio
# from recordAudio import record_audio
# from recordVideo import record_video   
from moviepy.editor import VideoFileClip, AudioFileClip
#from speechToText import extract_audio_from_video, transcribe_audio
from openai import OpenAI
import os
import firebase_admin
from firebase_admin import auth, credentials, firestore
from openai import OpenAI
from google.cloud.firestore_v1 import ArrayUnion
import bcrypt

# from speechToText import extract_audio, transcribe_audio
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

cred = credentials.Certificate("jobpair-305bf-firebase-adminsdk-z1lyx-2330215fb7.json")
firebase_admin.initialize_app(cred)

db=firestore.client()

# # Read the API key from a file
# with open("APIKEY", "r") as file:
#     api_key = file.read().strip()

# # Set the API key as an environment variable
# os.environ["OPENAI_API_KEY"] = api_key

# client = OpenAI()

#Fixed
@app.route('/signup', methods=['POST'])
def signup():
    try:
        # Parse the incoming data from the signup form
        signup_data = request.json
        username = signup_data['username']
        email = signup_data['email']
        full_name = signup_data['fullName']
        password = signup_data['password'] 
        user_type = signup_data['usertype']

        # Get the current user counter for the specific user_type collection
        counter_ref = db.collection(user_type).document('counter')
        counter_doc = counter_ref.get()

        if counter_doc.exists:
            counter_data = counter_doc.to_dict()
            new_user_id = counter_data['curr_count'] + 1  # Increment the counter to use as the new user's ID
 
            # Create a new document with the provided data plus the new_user_id
            user_ref = db.collection(user_type).document(username)
            user_ref.set({
                'email': email,
                'fullName': full_name,
                'username': username,
                'password': password,  
                'id': new_user_id,  # Assign the unique userID
            })

            # Update the counter in the database
            counter_ref.update({'curr_count': new_user_id})

            user_data = user_ref.get().to_dict()

            return jsonify({"success": True, "message": "User created successfully", 'user_data': user_data}), 201
        else:
            return jsonify({"success": False, "message": "Counter document does not exist"}), 500

    except Exception as e:
        # Handle exceptions
        return jsonify({"success": False, "message": str(e)}), 500
    
#Fixed
@app.route('/signin', methods=['POST'])
def signin():
    try:
        # Parse the incoming data from the sign-in form
        signin_data = request.json
        email = signin_data['email']
        password = signin_data['password']
        userType = signin_data['usertype']
        print(f"Attempting to sign in user: {email}, {userType}")

        # Query the Firestore database
        users_ref = db.collection(userType)
        query_ref = users_ref.where('email', '==', email).limit(1)
        docs = query_ref.stream()

        for doc in docs:
            user_doc = doc.to_dict()
            # print(f"Database returned: {user_doc}")
            stored_password = user_doc.get('password', '')
            # Here, you would check if the password matches (omitted for brevity).
            if password == stored_password:
                # Authentication successful
                return jsonify({"success": True, "message": "User signed in successfully", "user_data": user_doc}), 200
            else:
                # Password does not match
                return jsonify({"success": False, "message": "Incorrect password"}), 401

        # If the loop completes without returning, no user was found
        return jsonify({"success": False, "message": "User not found"}), 404

    except Exception as e:
        error_details = traceback.format_exc()  # Get the full traceback

        # It's usually not a good idea to send the full traceback to the client for security reasons.
        # Consider logging the traceback server-side, and sending a more generic error message to the client.
        print("Error details:", error_details)  # Log the full error
        # Handle exceptions
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/create_job', methods=['POST'])
def create_job():
    try:
        # Extract job and recruiter details from the form data
        job_title = request.form.get('job_title')
        job_location = request.form.get('job_location')
        salary = request.form.get('salary')
        technical_skills = request.form.get('technical_skills')
        company = request.form.get('company')
        deadline = request.form.get('deadline')
        job_description = request.form.get('job_description')
        company_logo_url = request.form.get('company_logo_url')
        recruiter_id = request.form.get('recruiter_id')
        questions_csv = request.form.get('questions')
        questions = questions_csv.split(',') if questions_csv else []

        # Create a new job document in the 'jobs' collection
        job_data = {
            'job_title': job_title,
            'job_location': job_location,
            'salary': salary,
            'technical_skills': technical_skills,
            'company': company,
            'deadline': deadline,
            'job_description': job_description,
            'company_logo_url': company_logo_url,
            'questions': questions
        }

        # Retrieve all jobs to determine the new job's ID
        total_jobs = db.collection('jobs').stream()
        num_jobs = len(list(total_jobs))

        # Assign an auto-incremented ID to the new job
        job_id = str(num_jobs + 1)
        job_data['id'] = job_id  # Append the calculated ID to the job_data dictionary
        new_job_ref = db.collection('jobs').add(job_data)  # Use add for auto-generated document ID

        # If recruiter_id is provided, update the recruiter's document
        if recruiter_id:
            # Find the recruiter's document by 'id' field
            recruiters_query = db.collection('recruiters').where('id', '==', int(recruiter_id)).limit(1)
            recruiters_docs = recruiters_query.stream()
            
            recruiter_doc = next(recruiters_docs, None)
            if recruiter_doc:
                # Add the job_id to the recruiter's my_job_ids array
                recruiter_ref = db.collection('recruiters').document(recruiter_doc.id)
                recruiter_ref.update({'my_job_ids': ArrayUnion([job_id])})
            else:
                # Recruiter not found, handle the error appropriately
                return jsonify({'error': 'Recruiter not found'}), 404

        # If everything is successful, return success message
        return jsonify({'success': True, 'message': 'Job created successfully', 'job_id': job_id}), 200

    except Exception as e:
        # Catch all exceptions and return an error message
        return jsonify({'error': str(e)}), 500
    

@app.route('/get_all_resources', methods=['GET'])
def get_all_resources():
    try:
        username = request.args.get('username')
        docs = db.collection('users').document(username).collection('resource').get()
        result = []

        for doc in docs:
            resource_data = doc.to_dict()
            resource_data['category'] = doc.id  # Add the 'category' field
            result.append(resource_data)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Fixed for job-pair
@app.route('/get_all_jobs_brief', methods=['GET'])
def get_all_jobs_brief():

    docs = db.collection('jobs').get()
    result = []
    for doc in docs:
        job_data = doc.to_dict()
        job_data.pop('Questions', None)
        job_data.pop('Requirements', None)  # Assuming jobs also have descriptions that are not needed in brief
        result.append(job_data)

    return jsonify(result)

#Fixed
@app.route('/get_all_jobs', methods=['GET'])
def get_all_jobs():
    userType = request.args.get('usertype')
    identifier = request.args.get('id')  # 'id' here is used generically; it could represent different types of identifiers.

    if userType == 'seekers':
        # Return all jobs for job seekers
        jobs = db.collection('jobs').get()
        result = [job.to_dict() for job in jobs]
        return jsonify(result), 200

    elif userType == 'recruiters':
        # For recruiters, find jobs posted by their company using a 'username' or similar identifier
        if not identifier:
            return jsonify({'error': 'Invalid request. Missing identifier for recruiter.'}), 400
        
        # Assuming 'identifier' represents a unique field akin to a username for recruiters
        # Adapted the search to use a 'where' clause as suggested

        identifier_int = int(identifier)
        recruiters = db.collection('recruiters').where('id', '==', identifier_int).limit(1).get()
        for recruiter in recruiters:
            recruiter_data = recruiter.to_dict()
            company_name = recruiter_data.get('company')

            # Assuming company_name exists and is valid, find jobs associated with this company
            jobs = db.collection('jobs').where('company', '==', company_name).get()
            result = [job.to_dict() for job in jobs]
            return jsonify(result), 200

        # If no recruiters were found or loop didn't return, indicate recruiter was not found
        return jsonify({'error': 'Recruiter not found.'}), 404

    else:
        return jsonify({'error': 'Invalid user type.'}), 400

#Fixed
@app.route('/get_all_applied_jobs', methods=['GET'])
def get_all_applied_jobs():
    seeker_id = request.args.get('id')

    # Validate that seeker ID is present
    if not seeker_id:
        return jsonify({'error': 'Invalid request. Missing user ID.'}), 400
    
    try:
        seeker_id = int(seeker_id)  # Convert to int, assuming ID is numeric
    except ValueError:
        return jsonify({'error': 'Invalid ID format. ID must be numeric.'}), 400

    seekers_query = db.collection('seekers').where('id', '==', seeker_id).limit(1)
    seekers_docs = seekers_query.get()

    applied_jobs = []

    if seekers_docs:
        seeker_doc_ref = seekers_docs[0].reference  # Get the document reference
        # Fetch all documents in the 'applied_jobs' subcollection
        applied_jobs_docs = seeker_doc_ref.collection('applied_jobs').get()
        # Iterate through the applied jobs and add their data to the list
        for job_doc in applied_jobs_docs:
            job_data = job_doc.to_dict()
            job_data['job_id'] = job_doc.id  # Include the job document ID
            applied_jobs.append(job_data)

    if applied_jobs:
        return jsonify({'applied_jobs': applied_jobs})
    else:
        # Return a message if no applied jobs were found
        return jsonify({'message': 'No applied jobs found for the given user ID.'}), 404

@app.route('/update_job_answer', methods=['POST'])  # Assuming this relates to updating a job application answer
def update_job_answer():
    try:
        # Get data from the request
        data = request.json
        seeker_id = data.get('user_id')
        job_id = data.get('job_id')
        index = data.get('index')
        updated_answer = data.get('updated_answer')

        # Validate required fields
        # if not seeker_id or not job_title or index is None or updated_answer is None:
        #     return jsonify({'error': 'Invalid request. Missing required fields.'}), 400

        # Start by querying the 'seekers' collection for the document with the matching 'id'
        seeker_query = db.collection('seekers').where('id', '==', seeker_id).limit(1)
        seeker_docs = seeker_query.get()

        # Check if we got any results back
        if not seeker_docs:
            return jsonify({'message': 'No applied jobs found for the given user ID, job ID.'}), 404

        # Assuming the seeker exists, we retrieve the first document
        seeker_doc_ref = seeker_docs[0].reference  # Get the reference to the document

        # Now, use the reference to access the 'applied_jobs' subcollection
        applied_jobs_query = seeker_doc_ref.collection('applied_jobs').where('job_id', '==', job_id).limit(1)
        applied_job = applied_jobs_query.get()

        if not applied_job :
            return jsonify({'message': 'No applied jobs found for the given user ID, job ID.'}), 404

        applied_job_ref = applied_job[0].reference
        applied_job_doc = applied_job_ref.get()
        current_answers = applied_job_doc.to_dict().get('application_response', [])

        if 0 <= index < len(current_answers):
            current_answers[index] = updated_answer
            applied_job_ref.update({'application_response': current_answers})
            return jsonify({'success': True})

        return jsonify({'error': 'Invalid index.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/submit_application', methods=['POST'])
def submit_application():
    try:
        # Extracting the application information and the seeker's ID from the request
        data = request.json
        seeker_id = data.get('id')  # This is the field 'id' inside the document.

        if not seeker_id:
            return jsonify({'error': 'Missing seeker ID'}), 400

        # Preparing the document data to be added
        application_data = {
            'application_date': data.get('application_date'),
            'application_response': data.get('application_response'),
            'application_status': data.get('application_status'),
            'company': data.get('company'),
            'job_id': data.get('job_id'),
            'job_title': data.get('job_title')
        }

        # Find the seeker using his id since it's not the key of his document but is unique
        seeker_query = db.collection('seekers').where('id', '==', seeker_id).limit(1).get()

        seeker_doc_ref = None
        for doc in seeker_query:
            seeker_doc_ref = doc.reference  # Get the document reference for the found seeker

        if seeker_doc_ref:
            # Adding the application information to the seeker's 'applied_jobs' subcollection
            seeker_doc_ref.collection('applied_jobs').add(application_data)
            return jsonify({'success': True, 'message': 'Application submitted successfully.'}), 200
        else:
            return jsonify({'error': 'Seeker not found'}), 404

    except Exception as e:
        # It's a good practice to log the exception here for debugging purposes
        return jsonify({'error': str(e)}), 500


# @app.route('/get_enhanced_essay', methods=['POST'])
# def get_enhanced_essay():
#     try:
#         # Get question and answer from the request JSON
#         question = request.json.get('question')
#         answer = request.json.get('answer')

#         # Define the initial conversation
#         conversations = [{"role": "system", "content": "You are a helpful assistant who specializes in enhancing users' job essays"}]

#         # Format user's request message
#         request_message = f"The question asked in my job application is this: {question} My Response is: {answer} Provide just the improved essay in about 100 words)"
#         request_message_formatted = {'content': request_message, 'role': 'user'}

#         # Add user's request to the conversation
#         conversations.append(request_message_formatted)

#         # Generate a response using OpenAI GPT-3.5-turbo
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=conversations
#         )

#         # Get the AI's response from the choices
#         ai_response = response.choices[0].message.content

#         return jsonify({'success': True, 'response': ai_response})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


# @app.route('/get_interview_feedback', methods=['POST'])
# def get_interview_feedback():
#     try:
#         # Get question and answer from the request JSON
#         question = request.json.get('question')
#         answer = request.json.get('answer')

#         conversations =[{"role": "system", "content": "You are an expert interview preparation assistant. Your goal is to provide constructive feedback and suggestions for improvement when given interview questions and a user's transcribed audio response. Emphasize clarity, relevance, and professionalism in your feedback."}] 

#         request_message = "The question asked in the interview is this: "+str(question)+" The transcribed response is: "+str(answer)+" Provide feedback to imrpove my response to ace the interview."
#         request_message_formatted = {'content': request_message, 'role': 'user'}

#         conversations.append(request_message_formatted)

#         # Generate a response using OpenAI GPT-3.5-turbo
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=conversations
#         )

#         # Get the AI's response from the choices
#         ai_response = response.choices[0].message.content

#         return jsonify({'success': True, 'response': ai_response})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

#Fixed
@app.route('/update_user_profile', methods=['POST'])
def update_user_profile():
    try:
        data = request.json
        userType = data.get('usertype')
        userId = data.get('id')  # This is the field 'id' inside the document.
        updated_info = data.get('updated_info')

        if not userType or not userId:
            return jsonify({'error': 'Missing userType or userId'}), 400

        collection_name = 'seekers' if userType == 'seekers' else 'recruiters' if userType == 'recruiters' else None
        if not collection_name:
            return jsonify({'error': 'Invalid userType'}), 400

        # First, find the document by id
        query = db.collection(collection_name).where('id', '==', userId).limit(1).stream()

        doc_ref = None
        for doc in query:
            doc_ref = doc.reference  # Get the document reference

        if not doc_ref:
            return jsonify({'error': 'User not found'}), 404

        # Define allowed fields based on userType
        allowed_fields = {'seekers': {'fullName', 'password', 'username', 'email', 'phoneNo', 'technicalSkills', 'expectedSalary', 'university'},
                          'recruiters': {'fullName', 'password', 'username', 'email', 'location', 'companyDescription'}}
        
        # Filter the updated_info to include only allowed fields
        filtered_response = {key: value for key, value in updated_info.items() if key in allowed_fields[userType]}

        # Perform the update
        doc_ref.update(filtered_response)

        return jsonify({'success': True, 'message': 'User profile updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/update_job_status', methods=['POST'])
def update_job_status():
    try:
        # Get data from the request
        data = request.json
        seeker_id = data.get('user_id')
        job_id = data.get('job_id')
        new_status = data.get('new_status')

        seeker_query = db.collection('seekers').where('id', '==', seeker_id).limit(1)
        seeker_docs = seeker_query.get()

        if not seeker_docs:  
            return jsonify({'message': 'No applied jobs found for the given user ID, job ID.'}), 404

        seeker_doc_ref = seeker_docs[0].reference  

        applied_jobs_ref  = seeker_doc_ref.collection('applied_jobs').document(job_id)
        applied_job = applied_jobs_ref.get()

        if not applied_job.exists:
            return jsonify({'message': 'Applied job not found for the given job ID.'}), 404

        applied_jobs_ref.update({'application_status': new_status})
        
        return jsonify({'success': True, 'message': 'Job status updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_my_job_applicants', methods=['GET'])
def get_my_job_applicants():
    try:
        print("Hello")
        # Extract job_id from the request args and ensure it's an integer
        job_id_str = request.args.get('job_id')
        if not job_id_str or not job_id_str.isdigit():
            return jsonify({'error': 'Missing or invalid job_id parameter'}), 400

        job_id = int(job_id_str)  # Convert to int safely after isdigit check
        print(job_id)

        # Find the job document by 'id' field
        jobs_query = db.collection('jobs').where('id', '==', job_id).limit(1)
        jobs_docs = jobs_query.stream()

        job_doc = next(jobs_docs, None)
        if not job_doc:
            return jsonify({'error': 'Job not found'}), 404
        
        job_data = job_doc.to_dict()
        applicant_ids = job_data.get('applicant_ids', [])
        
        print(applicant_ids)

        # Retrieve details for each applicant
        applicants_info = []
        for applicant_id in applicant_ids:
            # Query the 'seekers' collection for documents where 'applicant_id' field matches
            seekers_query = db.collection('seekers').where('id', '==', applicant_id).limit(1)
            seekers_docs = seekers_query.stream()

            seeker_doc = next(seekers_docs, None)
            if seeker_doc:
                applicants_info.append(seeker_doc.to_dict())
        return jsonify(applicants_info), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# @app.route('/test', methods=['GET'])
# def test():
#     conversations = [{"role": "system", "content": "You are a helpful assistant who specilaizes in enhancing users job essays"}]

#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=conversations
#     )

#     return jsonify({}), 200 



# @app.route('/upload_video', methods=['POST'])
# def upload_video():
#     video_file = request.files['video']
#     if video_file:
#         video_path = os.path.join('uploads', video_file.filename)
#         video_file.save(video_path)
        
#         # Process the video file and get feedback
#         ai_feedback = process_video_and_get_feedback(video_path)

#         # Return the AI feedback in the response
#         return jsonify({"message": "Video uploaded successfully", "ai_feedback": ai_feedback})
#     return jsonify({"error": "No video file provided"}), 400


# def process_video_and_get_feedback(video_file_path):
#     # Extract audio from the video
#     audio_file_path = extract_audio(video_path=video_file_path, audio_path="output_audio.wav")

    
#     # Transcribe the audio to text
#     transcribed_text = transcribe_audio("output_audio.wav")
#     print(transcribed_text)
#     # Prepare the conversation for AI feedback
#     question = "Tell Us About The Biggest Challenge Youve Ever Faced"
#     answer = transcribed_text
#     conversations = [
#         {
#             "role": "system",
#             "content": (
#                 "You are an expert interview preparation assistant. Your goal is to provide "
#                 "constructive feedback and suggestions for improvement when given interview "
#                 "questions and a user's transcribed audio response. Emphasize clarity, relevance, "
#                 "and professionalism in your feedback. Please format the feedback for HTML display. "
#                 "Use <p> for paragraphs, <br> for new lines, <ul> or <ol> for lists, and <strong> for "
#                 "emphasis. Ensure the feedback is well-structured and easy to read in an HTML document."
#             )
#         }
#     ]
#     request_message = "The question asked in the interview is this: "+str(question)+" The transcribed response is: "+str(answer)+" Provide feedback to improve my response to ace the interview."
#     request_message_formatted = {'content': request_message, 'role': 'user'}
#     conversations.append(request_message_formatted)

#     # Generate a response using OpenAI GPT-3.5-turbo
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=conversations
#     )

#     # Get the AI's response
#     ai_response = response.choices[0].message.content
#     testResponse = "Testing just random stuff"
#     print(ai_response)
#     return ai_response

# def process_video(video_path):
#     # Extract audio from video
#     extract_audio(video_path=video_path, audio_path="output_audio.wav")
#     text = transcribe_audio("output_audio.wav")
    

#     # Transcribe audio
#     # transcription = transcribe_audio(audio_path)  # Implement this function based on your transcription logic
    
#     # Additional processing...

# @app.route('/request_chatgpt', methods=['POST'])
# def chatgpt():

#     request_message_formatted = {'content': request_message, 'role': 'user'}
#     messages_to_send = read_chat(username) + [request_message_formatted]

#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=messages_to_send
#     )

#     response_message_formatted = {'content': response.choices[0].message.content, 'role': 'assistant'}
#     messages = [request_message_formatted]+[response_message_formatted]

#     write_chat(username, messages)

# @app.route('/write_chat', methods=['POST'])
# def write_chat():
#     # Get JSON data from the request
#     data = request.json
    
#     # Extract username and messages from the JSON data
#     username = data.get('username')
#     messages = data.get('messages', [])

#     # Validate that both username and messages are present
#     if not username or not messages:
#         return jsonify({'error': 'Invalid request. Missing username or messages.'}), 400

#     # Add messages to the chat in the database
#     for message in messages:
#         db.collection('users').document(username).collection('chat').add({'message': message})

#     return jsonify({'success': True})

# @app.route('/read_chat', methods=['GET'])
# def read_chat():
#     # Get username from the query parameters
#     username = request.args.get('username')

#     # Validate that username is present
#     if not username:
#         return jsonify({'error': 'Invalid request. Missing username.'}), 400

#     # Retrieve messages from the chat in the database
#     docs = db.collection('users').document(username).collection('chat').get()
#     result = [doc.to_dict()['message'] for doc in docs]

#     return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)