import threading
# from moviepy.editor import VideoFileClip, AudioFileClip
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
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


@app.route('/signup', methods=['POST'])
def signup():
    try:
        # Get user data from the request
        data = request.json
        email = data.get('email')
        password = data.get('password')
        phone_number = data.get('phone_number')
        username = data.get('username')
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        # Create a new user account with the provided email and password
        user = auth.create_user(
            email=email,
            password=password
        )

        data_to_store = {
            "email": email,
            "password": password,
            "phone_number": phone_number,
            "username": username,
            "first_name": first_name,
            "last_name": last_name
        }

        # Update user profile in the database
        db.collection('users').document(username).collection('personal_info').document('my_info').set(data_to_store)

        return jsonify({'success': True}), 201  # Corrected closing parenthesis

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint for user login
@app.route('/login', methods=['POST'])
def login():
    try:
        # Get user data from the request
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # Sign in the user with the provided email and password
        user = auth.get_user_by_email(email)
        user_token = auth.create_custom_token(user.uid)

        return jsonify({'success': True, 'uid': user.uid, 'token': user_token}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 401

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


@app.route('/get_all_jobs_brief', methods=['GET'])
def get_all_jobs_brief():
    username = request.args.get('username')

    # Validate that username is present
    if not username:
        return jsonify({'error': 'Invalid request. Missing username.'}), 400

    docs = db.collection('users').document(username).collection('jobs').get()
    result = []
    for doc in docs:
        job_data = doc.to_dict()
        # Remove "Questions" and "Answers" fields if they exist, and "Description"
        job_data.pop('Questions', None)
        job_data.pop('Answers', None)
        job_data.pop('Description', None)  # Assuming jobs also have descriptions that are not needed in brief
        result.append(job_data)

    return jsonify(result)

@app.route('/get_all_jobs', methods=['GET'])
def get_all_jobs():
    username = request.args.get('username')

    # Validate that username is present
    if not username:
        return jsonify({'error': 'Invalid request. Missing username.'}), 400

    docs = db.collection('users').document(username).collection('jobs').get()
    result = [doc.to_dict() for doc in docs]

    return jsonify(result)

@app.route('/update_job_answer', methods=['POST'])  # Assuming this relates to updating a job application answer
def update_job_answer():
    try:
        # Get data from the request
        data = request.json
        username = data.get('username')
        job_title = data.get('title')
        index = data.get('index')
        updated_answer = data.get('updated_answer')

        # Validate required fields
        if not username or not job_title or index is None or updated_answer is None:
            return jsonify({'error': 'Invalid request. Missing required fields.'}), 400

        # Retrieve the job document
        job_ref = db.collection('users').document(username).collection('jobs').document(job_title)
        job_doc = job_ref.get().to_dict()

        # Update the 'Answers' field at the specified index
        current_answers = job_doc.get('Answers')

        if 0 <= index < len(current_answers):
            print(index)
            current_answers[index] = updated_answer
            job_ref.update({'Answers': current_answers})
            return jsonify({'success': True})

        return jsonify({'error': 'Invalid index.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/submit_application', methods=['POST'])
def submit_application():
    try:
        data = request.json
        username = data.get('username')
        title = data.get('title')

        # Update the 'Submitted' field to True
        db.collection('users').document(username).collection('job').document(title).update({'Submitted': True})

        return jsonify({'success': True, 'message': 'Application submitted successfully.'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# @app.route('/get_enhanced_essay', methods=['POST'])
# def get_enhanced_essay():
#     try:
#         # Get question and answer from the request JSON
#         question = request.json.get('question')
#         answer = request.json.get('answer')

#         # Define the initial conversation
#         conversations = [{"role": "system", "content": "You are a helpful assistant who specializes in enhancing users' scholarship essays"}]

#         # Format user's request message
#         request_message = f"The question asked in my scholarship application is this: {question} My Response is: {answer} Provide just the improved essay in about 100 words)"
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

@app.route('/update_user_profile', methods=['POST'])
def update_user_profile():
    try:
        # Get data from the request
        data = request.json
        username = data.get('username')
        user_response = data.get('user_response')

        # Update user profile in the database
        db.collection('users').document(username).set(user_response)

        return jsonify({'success': True, 'message': 'User profile updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_job_status', methods=['POST'])
def update_job_status():
    try:
        # Get data from the request
        data = request.json
        username = data.get('username')
        job_title = data.get('title')
        new_status = data.get('new_status')

        # Update user profile in the database
        db.collection('users').document(username).collection('jobs').document(job_title).update({'Status': new_status})

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
    

@app.route('/get-job', methods=['GET', 'POST'])
def get_job():
    data = request.json
    id  = data.get('id')
    
    if id is None:
        return jsonify({"error": "Missing id"}), 400

    try:
        query_ref = db.collection('jobs').where('id', '==', id)
        docs = query_ref.stream()

        results = [doc.to_dict() for doc in docs]
        
        if results:
            return jsonify(results[0]), 200
        else:
            return jsonify({"error": "No records found matching id"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/update-job', methods=['GET','PUT'])
def update_job():
    job_id = request.form.get('id')
    job_title = request.form.get('job_title')
    job_location = request.form.get('job_location')
    salary = request.form.get('salary')
    technical_skills = request.form.get('technical_skills')
    company = request.form.get('company')
    deadline = request.form.get('deadline')
    job_description = request.form.get('job_description')
    questions_csv = request.form.get('questions')

    if not job_id:
        return jsonify({"error": "Missing job ID"}), 400

    update_data = {}
    if job_title: update_data['job_title'] = job_title
    if job_location: update_data['job_location'] = job_location
    if salary: update_data['salary'] = salary
    if technical_skills: update_data['technical_skills'] = technical_skills
    if company: update_data['company'] = company
    if deadline: update_data['deadline'] = deadline
    if job_description: update_data['job_description'] = job_description
    if questions_csv: update_data['questions_csv'] = questions_csv
    update_data['id'] = job_id

    try:
        query_ref = db.collection('jobs').where('id', '==', job_id)
        docs = list(query_ref.stream())
        if docs is not None:
            doc = docs[0]
            doc.reference.update(update_data)
            return jsonify({"success": "Job updated successfully"}), 200
        else:
            return jsonify({"error": "No  jobs found matching id"}), 404
        
       
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/delete-job/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    data = request.json
    
    
    if job_id is None:
        return jsonify({"error": "Missing id"}), 400

    try:
        query_ref = db.collection('jobs').where('id', '==', job_id)
        docs = query_ref.stream()

        if docs is not None:
            doc = docs[0]
            doc.reference.delete()
            return jsonify({"success": "Job deleted successfully"}), 200

        return jsonify({"error": "No matching jobs found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.route('/test', methods=['GET'])
# def test():
#     conversations = [{"role": "system", "content": "You are a helpful assistant "}]

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