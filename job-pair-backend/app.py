from datetime import datetime, date
import threading
from moviepy.editor import VideoFileClip, AudioFileClip
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
from moviepy.editor import VideoFileClip, AudioFileClip
from speechToText import extract_audio, transcribe_audio
from openai import OpenAI
import os
import firebase_admin
from firebase_admin import auth, credentials, firestore
from openai import OpenAI
from google.cloud.firestore_v1 import ArrayUnion
import requests
# import bcrypt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

cred = credentials.Certificate("jobpair-305bf-firebase-adminsdk-z1lyx-2330215fb7.json")
firebase_admin.initialize_app(cred)

db=firestore.client()

# Read the API key from a file
with open("APIKEY", "r") as file:
    api_key = file.read().strip()

# Set the API key as an environment variable
os.environ["OPENAI_API_KEY"] = api_key

client = OpenAI()

#chat gpt used in several endpoints in this file to connect to firebase db and process rest api requests
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
        user_type = signup_data['userType']

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
                'name': full_name,
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
        userType = signin_data['userType']
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
        job_title = request.form.get('title')
        job_location = request.form.get('location')
        salary = request.form.get('salary')
        technical_skills = request.form.get('technical_skills')
        company = request.form.get('company')
        deadline = request.form.get('deadline')
        job_description = request.form.get('description')
        company_logo_url = request.form.get('logo_url')
        recruiter_id = int(request.form.get('recruiter_id'))
        questions = request.form.getlist('questions[]') 
        questions_count = int(request.form.get('questions_count'))
        posting_date = datetime.utcnow().date().isoformat()

        #convert questions to list

        # Create a new job document in the 'jobs' collection
        job_data = {
            'title': job_title,
            'location': job_location,
            'salary': salary,
            'technical_skills': technical_skills,
            'company': company,
            'deadline': deadline,
            'Description': job_description,
            'logo_url': company_logo_url,
            "applicant_ids": [],
            'Questions': questions,
            'posting_date': posting_date,
            'applicants': 0,
            "logo_url":"https://i.pinimg.com/originals/b7/86/79/b786795a5bfba85a9d0422b015d2a460.jpg",
            'question_count': questions_count
        }

        # Retrieve all jobs to determine the new job's ID
        total_jobs = db.collection('jobs').stream()
        num_jobs = len(list(total_jobs))

        # Assign an auto-incremented ID to the new job
        job_id = int(num_jobs + 1)
        job_data['id'] = job_id  # Append the calculated ID to the job_data dictionary
        new_job_ref = db.collection('jobs').add(job_data)  # Use add for auto-generated document ID

        # If recruiter_id is provided, update the recruiter's document
        if recruiter_id:
            # Find the recruiter's document by 'id' field
            recruiters_query = db.collection('recruiters').where('id', '==', recruiter_id).limit(1)
            recruiters_docs = recruiters_query.stream()
            
            recruiter_doc = next(recruiters_docs, None)
            print("recruiter doc: ", recruiter_doc)
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


#firebase only allows in clause to have 10 items at a time, so divide list into chunks of 10
def divide_into_chunks_of_10(l):
    for i in range(0, len(l), 10):
        yield l[i:i + 10]
#Fixed
@app.route('/get_all_jobs', methods=['GET'])
def get_all_jobs():
    userType = request.args.get('userType')
    identifier = int(request.args.get('id'))  # 'id' here is used generically; it could represent different types of identifiers.

    print("user id: ", identifier)
    print("user type: ", userType)
    print("user id data type: ", type(identifier))

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
        job_ids_chunks = []
        for recruiter in recruiters:
            job_ids = recruiter.to_dict().get('my_job_ids', [])
            job_ids_chunks = list(divide_into_chunks_of_10(job_ids))
        jobs = []
        for chunk in job_ids_chunks:
            jobs_query = db.collection('jobs').where('id', 'in', chunk).stream()
            for job in jobs_query:
                jobs.append(job.to_dict())
                
            
            return jsonify(jobs), 200

        # If no recruiters were found or loop didn't return, indicate recruiter was not found
        return jsonify({'error': 'No job found for recruiter.'}), 403
    elif userType == 'admins':
        # For admins, return all jobs
        jobs = db.collection('jobs').get()
        result = [job.to_dict() for job in jobs]
        return jsonify(result), 200

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
            job_data['id'] = job_doc.id  # Include the job document ID
            applied_jobs.append(job_data)

    if applied_jobs:
        return jsonify({'applied_jobs': applied_jobs})
    else:
        # Return a message if no applied jobs were found
        return jsonify({'message': 'No applied jobs found for the given user ID.'}), 404

@app.route('/update_job_answer', methods=['POST'])  # Assuming this relates to updating a job application answer
def update_job_answer():
    try:
        print("Reached endpoint!")
        # Get data from the request
        data = request.json
        seeker_id = int(data.get('user_id'))
        job_id = int(data.get('job_id'))
        index = data.get('index')
        updated_answer = data.get('updated_answer')

        print(data)

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


@app.route('/get_job_answer', methods=['GET'])
def get_job_answer():
    try:
        # Get data from the request
        user_id = int(request.args.get('user_id'))
        job_id = int(request.args.get('job_id'))

        # Validate required fields
        if not user_id or not job_id:
            return jsonify({'error': 'Invalid request. Missing required user_id or job_id parameters.'}), 400

        # Assuming db is set up and has collections, fetch data
        seeker_query = db.collection('seekers').where('id', '==', user_id).limit(1)
        seeker_docs = seeker_query.get()

        # Check if we have a matching user
        if not seeker_docs:
            return jsonify({'message': 'No user found with the provided user ID.'}), 404

        # Access the first document reference from the result
        seeker_doc_ref = seeker_docs[0].reference

        # Fetch the applied jobs by job_id
        applied_jobs_query = seeker_doc_ref.collection('applied_jobs').where('job_id', '==', job_id).limit(1)
        applied_jobs = applied_jobs_query.get()

        if not applied_jobs:
            return jsonify({'message': 'No job application found for the given user ID and job ID.'}), 404

        # Assuming there's a job application, access the document
        applied_job_doc = applied_jobs[0]
        job_application_answers = applied_job_doc.to_dict().get('application_response', [])

        return jsonify({'user_id': user_id, 'job_id': job_id, 'answers': job_application_answers})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/submit_application', methods=['POST'])
def submit_application():
    try:
        # Extracting the application information and the seeker's ID from the request
        data = request.json
        seeker_id = int(data.get('id'))  # This is the field 'id' inside the document.
        print("seeker id: ", seeker_id)

        if not seeker_id:
            return jsonify({'error': 'Missing seeker ID'}), 400
        


        job_id = int(data.get('job_id'))
        job_query = db.collection('jobs').where('id', '==', job_id).limit(1).get()
        if not job_query: 
            return jsonify({'error': 'Job not found'}), 404
        job_doc_ref = job_query[0].reference 
        job_doc_ref.update({'applicants': firestore.Increment(1)})
       
        job_doc_ref.update({'applicant_ids': ArrayUnion([seeker_id])})

        # get company name from job doc
        company = job_doc_ref.get().to_dict().get('company')


        application_response = data.get('application_response')

        if isinstance(application_response, str):
            application_response = [application_response]  # Convert string to list if it's a single answer

        # Preparing the document data to be added
        application_data = {
            'application_date': datetime.utcnow().date().isoformat(),
            'application_response': application_response,
            'application_status': 'applied',  # Default status is 'applied
            'company': company,
            'job_id': int(data.get('job_id')),
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
        return jsonify({'error': str(e)}), 500


def get_personal_setup_info(user_id):
    try:
        # Assuming you have a database connection and 'seekers' collection
        # Replace 'db' and 'seekers' with your actual database reference
        query_ref = db.collection('seekers').where('id', '==', user_id).limit(1)
        docs = list(query_ref.stream())

        if docs:
            personal_setup_info = None
            for doc in docs:
                personal_setup_info = doc.get('personal_setup_info')
                break

            if personal_setup_info:
                return personal_setup_info
            else:
                return "No personal setup info found for the provided user ID"
        else:
            return "No seeker found with the provided user ID"

    except Exception as e:
        return str(e)


@app.route('/create_application', methods=['POST'])
def create_application():
    try:
        # Extracting the application information and the seeker's ID from the request
        data = request.json
        seeker_id = int(data.get('id'))  # This is the field 'id' inside the document.

        if not seeker_id:
            return jsonify({'error': 'Missing seeker ID'}), 400
        
        personal_setup_info = get_personal_setup_info(seeker_id)

        job_id = int(data.get('job_id'))
        
        # Find the seeker using his id since it's not the key of his document but is unique
        seeker_query = db.collection('seekers').where('id', '==', seeker_id).limit(1).get()

        seeker_doc_ref = None
        for doc in seeker_query:
            seeker_doc_ref = doc.reference  # Get the document reference for the found seeker

        if seeker_doc_ref:
            # Check if the job_id already exists in applied_jobs subcollection
            job_ref = seeker_doc_ref.collection('applied_jobs').where('job_id', '==', job_id).limit(1).get()
            if job_ref:
                # If the job_id already exists, return success message indicating the application was already submitted
                return jsonify({'success': True, 'message': 'Application already submitted for this job.'}), 200
            else:
                # If the job_id doesn't exist, proceed with the application creation process
                job_questions = get_job_questions(job_id)

                print("job_questions: ", job_questions)

                application_responses = []
                
                for i in range(len(job_questions)):
                    application_responses.append(get_enhanced_essay_helper(job_questions[i], personal_setup_info))
                
                # Preparing the document data to be added
                application_data = {
                    'application_date': datetime.utcnow().date().isoformat(),
                    'application_status': 'in_progress',  # Default status is 'in_progress'
                    'company': data.get('company'),
                    'job_id': job_id,
                    'job_title': data.get('job_title'),
                    'application_response': application_responses,
                }

                # Add the application information to the subcollection
                seeker_doc_ref.collection('applied_jobs').add(application_data)
                return jsonify({'success': True, 'message': 'Application created successfully.'}), 200
        else:
            return jsonify({'error': 'Seeker not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_enhanced_essay_helper(question, answer):
    # Define the initial conversation
    conversations = [{"role": "system", "content": "You are a helpful assistant who specializes in enhancing users' job essays"}]

    # Format user's request message
    request_message = f"The question asked in my job application is this: {question} My Response is: {answer} Provide just the improved essay in about 100 words, not this essay can include negative aspects like me being jobless to show character development)"
    request_message_formatted = {'content': request_message, 'role': 'user'}

    # Add user's request to the conversation
    conversations.append(request_message_formatted)

    # Generate a response using OpenAI GPT-3.5-turbo
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=conversations
    )

    # Get the AI's response from the choices
    ai_response = response.choices[0].message.content

    return ai_response

def get_job_questions(job_id):
    try:
        print("Hello")

        job_id = int(job_id)
        job_ref = db.collection('jobs').where('id', '==', job_id).limit(1).get()

        if not job_ref:
            return []

        job_data = [doc.to_dict() for doc in job_ref]
        questions = [job.get('Questions') for job in job_data if 'Questions' in job]
        return questions[0] if questions else []

    except Exception as e:
        print(f"Error: {e}")
        return []

@app.route('/get_enhanced_essay', methods=['POST'])
def get_enhanced_essay():
    try:
        # Get question and answer from the request JSON
        question = request.json.get('question')
        answer = request.json.get('answer')

        print("question: ", question)
        print("latest answer: ", answer)

        # Define the initial conversation
        conversations = [{"role": "system", "content": "You are a helpful assistant who specializes in enhancing users' job essays"}]

        # Format user's request message
        request_message = f"The question asked in my job application is this: {question} My Response is: {answer} Provide just the improved essay in about 100 words, not this essay can include negative aspects like me being jobless to show character development)"
        request_message_formatted = {'content': request_message, 'role': 'user'}

        # Add user's request to the conversation
        conversations.append(request_message_formatted)

        # Generate a response using OpenAI GPT-3.5-turbo
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=conversations
        )

        # Get the AI's response from the choices
        ai_response = response.choices[0].message.content

        return jsonify({'success': True, 'response': ai_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
        userType = data.get('userType')
        userId = data.get('id')  # This is the field 'id' inside the document.
        updated_data = data.get('updatedData')

        if not userType or not userId:
            return jsonify({'error': 'Missing userType or userId'}), 400

        collection_name = 'seekers' if userType == 'seekers' else 'recruiters' if userType == 'recruiters' else None
        if not collection_name:
            return jsonify({'error': 'Invalid userType'}), 400

        # First, find the document by id
        query = db.collection(collection_name).where('id', '==', int(userId)).limit(1).stream()

        doc_ref = None
        for doc in query:
            doc_ref = doc.reference  # Get the document reference

        if not doc_ref:
            return jsonify({'error': 'User not found'}), 404

        # Define allowed fields based on userType
        allowed_fields = {'seekers': {'name', 'password', 'username', 'email', 'phoneNumber', 'techSkills', 'expectedSalary', 'institution','gender','pronouns','location','preferredJobTitle'},
                          'recruiters': {'name', 'password', 'username', 'email', 'location', 'companyDescription','phoneNumber'}}
        #if updated_data['password'] is not None and updated_data['password'] != '':
            #updated_data['password'] = bcrypt.hashpw(updated_data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if updated_data['password'] is not None and updated_data['password'] == '':
            updated_data.pop('password')
        # Filter the updated_info to include only allowed fields
        filtered_response = {key: value for key, value in updated_data.items() if key in allowed_fields[userType]}

        # Perform the update
        doc_ref.update(filtered_response)

        return jsonify({'success': True, 'message': 'User profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_user', methods=['POST'])
def get_user():
    data = request.json
    userType = data.get('userType')
    userId = data.get('id') 


    if not userType or not userId:
        return jsonify({'error': 'Missing userType or userId'}), 400

    collection_name = 'seekers' if userType == 'seekers' else 'recruiters' if userType == 'recruiters' else None
    if not collection_name:
        return jsonify({'error': 'Invalid userType'}), 400
    
    try:
        if not userId:
            return {'message': 'Missing id parameter'}, 400
    
        query_ref = db.collection(collection_name).where('id', '==', int(userId)).limit(1)
        docs = list(query_ref.stream())
    
        if docs is not None and len(docs) > 0:
            doc = docs[0]
            data = doc.to_dict()
            data.pop('password', None)  # Remove password from the response

            
            return jsonify(data), 200
        else:
            return jsonify({"error": "No users found matching id"}), 404
    
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



@app.route('/update_job_status', methods=['POST'])
def update_job_status():
    try:
        # Get data from the request
        data = request.json
        seeker_id = int(data.get('user_id'))
        application_id = data.get('application_id')
        new_status = data.get('new_status')

        seeker_query = db.collection('seekers').where('id', '==', seeker_id).limit(1)
        seeker_docs = seeker_query.get()

        if not seeker_docs:  
            return jsonify({'message': 'No applied jobs found for the given user ID, application ID.'}), 404

        seeker_doc_ref = seeker_docs[0].reference  

        applied_jobs_ref  = seeker_doc_ref.collection('applied_jobs').document(application_id)
        applied_job = applied_jobs_ref.get()

        if not applied_job.exists:
            return jsonify({'message': 'Applied job not found for the given application ID.'}), 404

        applied_jobs_ref.update({'application_status': new_status})
        
        return jsonify({'success': True, 'message': 'Job status updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/seeker-profile-setup', methods=['PUT'])
def seeker_profile_setup():
    # Extract user ID from the request data
    user_id = int(request.json.get('seekerId'))

    # Extract user information from the form data
    industry = request.json.get('industry')
    gpa = request.json.get('gpa')
    graduated = request.json.get('graduated')
    university_name = request.json.get('universityName')
    last_company = request.json.get('lastCompany')
    aspirations = request.json.get('aspirations')
    strengths = request.json.get('strengths')
    leadership = request.json.get('leadership')

    # Check if user ID is provided
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    # Construct the personal setup info
    personal_setup_info = f"{aspirations} {strengths} {leadership}"

    # Construct the update data
    update_data = {}
    if industry: update_data['industry'] = industry
    if gpa: update_data['GPA'] = gpa
    if graduated: update_data['graduated'] = graduated
    if university_name: update_data['university'] = university_name
    if last_company: update_data['lastCompany'] = last_company
    if personal_setup_info: update_data['personal_setup_info'] = personal_setup_info

    # Update user information in the database
    try:
        # Assuming you have a database connection and 'users' collection
        # Replace 'db' and 'users' with your actual database reference
        query_ref =  db.collection('seekers').where('id', '==', user_id).limit(1)
        docs = list(query_ref.stream())
        if docs:
            doc = docs[0]
            doc.reference.update(update_data)
            return jsonify({"success": "User information updated successfully"}), 200
        else:
            return jsonify({"error": "No seeker found with the provided user ID"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/update-job', methods=['GET','PUT'])
def update_job():
    job_id = int(request.form.get('id'))
    # Extract job and recruiter details from the form data
    job_title = request.form.get('title')
    job_location = request.form.get('location')
    salary = request.form.get('salary')
    technical_skills = request.form.get('technical_skills')
    company = request.form.get('company')
    deadline = request.form.get('deadline')
    job_description = request.form.get('description')
    company_logo_url = request.form.get('logo_url')
    questions = request.form.getlist('questions[]') 
    questions_count = int(request.form.get('questions_count'))


    if not job_id:
        return jsonify({"error": "Missing job ID"}), 400

    update_data = {}
    if job_title: update_data['title'] = job_title
    if job_location: update_data['location'] = job_location
    if salary: update_data['salary'] = salary
    if technical_skills: update_data['technical_skills'] = technical_skills
    if company: update_data['company'] = company
    if deadline: update_data['deadline'] = deadline
    if job_description: update_data['description'] = job_description
    if company_logo_url: update_data['logo_url'] = company_logo_url
    if questions: update_data['questions'] = questions
    if questions_count: update_data['questions_count'] = questions_count

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
    

@app.route('/delete-job', methods=['DELETE'])
def delete_job():
    job_id = request.args.get('job_id')
    
    if job_id is None:
        return jsonify({"error": "Missing id"}), 400
    
    try:
        job_id = int(job_id)
        print("job id: ", job_id)
        query_ref = db.collection('jobs').where('id', '==', job_id)
        docs = query_ref.stream()

        for doc in docs:
            # Document exists; delete it
            doc.reference.delete()
            return jsonify({"success": "Job deleted successfully"}), 200

        # If no documents were found
        return jsonify({"error": "No matching jobs found"}), 404
    
    except ValueError:
        return jsonify({"error": "Invalid ID format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/create-chat', methods=['POST'])
def create_chat():
    data = request.json
    recruiter_id = int(data.get('user_id'))
    seeker_id = int(data.get('recipient_id'))

    if not recruiter_id or not seeker_id:
        return jsonify({"error": "Missing user ID or recipient ID"}), 400

    try:
        # Check if a chat already exists between the recruiter and seeker
        chat_query = db.collection('chats').where('recruiter_id', '==', recruiter_id).where('seeker_id', '==', seeker_id).limit(1).stream()
        existing_chat = None
        for chat in chat_query:
            existing_chat = chat.to_dict()
            break

        if existing_chat:
            # If a chat already exists, return its ID and success message
            return jsonify({"success": "Chat already exists", "chat_id": chat.id}), 200

        # Retrieve recruiter and seeker information
        recruiter_doc = db.collection('recruiters').document(str(recruiter_id)).get()
        seeker_doc = db.collection('seekers').document(str(seeker_id)).get()

        if not recruiter_doc.exists or not seeker_doc.exists:
            return jsonify({"error": "Recruiter or Seeker not found"}), 404

        recruiter_name = recruiter_doc.to_dict().get('name')
        recruiter_company = recruiter_doc.to_dict().get('company')
        seeker_name = seeker_doc.to_dict().get('name')

        chat_data = {
            'recruiter_id': recruiter_id,
            'seeker_id': seeker_id,
            'recruiter_name': recruiter_name,
            'recruiter_company': recruiter_company,
            'seeker_name': seeker_name,
            'messages': [],
            'date': datetime.utcnow().date().isoformat()
        }

        chat_ref = db.collection('chats').add(chat_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"success": "Chat created successfully", "chat_id": chat_ref.id}), 201


@app.route('/get-messages', methods=['GET'])
def get_messages():
    chat_id = request.args.get('chat_id')
    user_id = request.args.get('user_id')

    if not chat_id:
        return jsonify({"error": "Missing chat ID"}), 400

    try:
        chat_ref = db.collection('chats').document(chat_id)

        chat_doc = chat_ref.get()

        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            messages = chat_data.get('messages', [])
            ret_val = {
                'messages': messages,
                'recruiterName': chat_data.get('recruiter_name'),
                'seekerName': chat_data.get('seeker_name'),
            }
            return jsonify(ret_val), 200
        else:
            if chat_doc.get('deleted'):
                return jsonify({"error": "Chat has been deleted"}), 404
            return jsonify({"error": "Chat not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/get-chats', methods=['GET'])
def get_chats():
    user_id = int(request.args.get('user_id'))
    user_type = request.args.get('user_type')

    print("user id: ", user_id)
    print("user type: ", user_type)


    if not user_id or not user_type:
        return jsonify({"error": "Missing user ID or user type"}), 400

    try:
        user_field = 'recruiter_id' if user_type == 'recruiters' else 'seeker_id'

        print("user field: ", user_field)

        chats_query = db.collection('chats').where(user_field, '==', user_id).stream()

        print("chats query: ", chats_query)

        chats = []
        for chat in chats_query:
            chat_dict = chat.to_dict()
            
            print("Chats dict: ", chat_dict)
            last_message = chat_dict['messages'][-1]['message'] if chat_dict.get('messages') else ""
            sender = chat_dict.get('seeker_name') if user_type == 'recruiters' else chat_dict.get('recruiter_name')
            chats.append({
                'recruiter_id': chat_dict.get('recruiter_id'),
                'seeker_id': chat_dict.get('seeker_id'),
                'lastMessage': last_message,
                'sender': sender,
                'date': chat_dict.get('date'),
                'id': chat.id,
                'deleted': chat_dict.get('deleted'),
                'flagged': chat_dict.get('flagged')
            })

        print("Chats received: ", chats)

        return jsonify(chats), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/get-chats-admin', methods=['GET'])
def get_chats_admin():
    user_type = request.args.get('user_type')

    # Check if the user is an admin
    # if user_type != 'admin':
    #     return jsonify({"error": "Unauthorized access"}), 403

    try:
        chats_query = db.collection('chats').where('flagged', '==', True).stream()

        chats = []
        for chat in chats_query:
            chat_dict = chat.to_dict()
            last_message = chat_dict['messages'][-1]['message'] if chat_dict.get('messages') else ""
            sender = chat_dict.get('seeker_name') if 'recruiter_id' in chat_dict else chat_dict.get('recruiter_name')
            chats.append({
                'recruiter_id': chat_dict.get('recruiter_id'),
                'recruiter_company': chat_dict.get('recruiter_company'),
                'seeker_id': chat_dict.get('seeker_id'),
                'lastMessage': last_message,
                'sender': sender,
                'date': chat_dict.get('date'),
                'id': chat.id,
                'deleted': chat_dict.get('deleted'),
                'flagged': chat_dict.get('flagged')
            })

        return jsonify(chats), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/add-message', methods=['POST'])
def add_message():
    data = request.json
    chat_id = data.get('chat_id')
    sender_id = data.get('sender_id')
    message_text = data.get('message')
    time = data.get('time')
    date = data.get('date')

    if not chat_id or not sender_id or message_text is None or time is None or date is None: 
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        chat_ref = db.collection('chats').document(chat_id)
        chat = chat_ref.get()

        if not chat.exists:
            return jsonify({"error": "Chat not found"}), 404

        # construct the new message with current time and date
        new_message = {
            'sender_id': sender_id,
            'message': message_text,
            'time': time,
            'date': date
        }

        # add the new message to the 'messages' array
        chat_ref.update({'messages': firestore.ArrayUnion([new_message])})

        return jsonify({"success": "Message added successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete-conversation/<conversation_id>', methods=['PUT'])
def delete_conversation(conversation_id):
    try:
        conversation_ref = db.collection('chats').document(conversation_id)
        conversation_ref.update({'deleted': True})
        conversation_ref.update({'flagged': False})
        return jsonify({"success": "Conversation deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/resolve-conversation/<conversation_id>', methods=['PUT'])
def resolve_conversation(conversation_id):
    try:
        conversation_ref = db.collection('chats').document(conversation_id)
        conversation_ref.update({'flagged': False})
        return jsonify({"success": "Conversation resolved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/flagChat', methods=['POST'])
def flag_conversation():
  chatId = request.json.get('chatId')
  flagged = request.json.get('flagged')

  if chatId is None or flagged is None:
    return {'error': 'Missing required fields in request'}, 400

  try:
    doc_ref = db.collection('chats').document(chatId)
    doc_ref.update({'flagged': flagged})
    return {'message': 'Chat flag updated successfully'}, 200
  except Exception as e:
    return {'error': f'Error updating chat flag: {str(e)}'}, 500
  



@app.route('/send-interview', methods=['POST'])
def send_interview():
    data = request.json
    user_id = int(data.get('user_id'))
    job_id = int(data.get('job_id'))

    if not user_id or not job_id:
        return jsonify({"error": "Missing user_id or job_id"}), 400

    try:
     
        seekers_query = db.collection('seekers').where('id', '==', user_id).limit(1)
        seekers_docs = seekers_query.stream()

        seeker_found = next(seekers_docs, None)
        if seeker_found is None:
            return jsonify({"error": "No seeker found with the provided user_id"}), 404

     
        applied_jobs_ref = seeker_found.reference.collection('applied_jobs')
        job_query = applied_jobs_ref.where('job_id', '==', job_id).limit(1)
        job_docs = job_query.stream()

       
        job_found = next(job_docs, None)
        if job_found:
            job_found.reference.update({'application_status': 'interview'})
            return jsonify({"success": "Application status updated to interview"}), 200
        else:
            return jsonify({"error": "No application found for the provided job_id"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        print(job_data)
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
                print(seeker_doc.to_dict())
                applicants_info.append(seeker_doc.to_dict())

        print(applicants_info)
        return jsonify(applicants_info), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# @app.route('/test', methods=['GET'])
# def test():
#     conversations = [{"role": "system", "content": "You are a helpful assistant "}]

#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=conversations
#     )

#     return jsonify({}), 200 



@app.route('/upload_video', methods=['POST'])
def upload_video():
    video_file = request.files['video']
    if video_file:
        video_path = os.path.join('uploads', video_file.filename)
        os.makedirs(os.path.dirname(video_path), exist_ok=True)
        video_file.save(video_path)
        
        # Process the video file and get feedback
        ai_feedback = process_video_and_get_feedback(video_path)

        # Return the AI feedback in the response
        return jsonify({"message": "Video uploaded successfully", "ai_feedback": ai_feedback})
    return jsonify({"error": "No video file provided"}), 400


def process_video_and_get_feedback(video_file_path):
    print("inside process video")
    # Extract audio from the video
    audio_file_path = extract_audio(video_path=video_file_path, audio_path="output_audio.wav")

    
    # Transcribe the audio to text
    transcribed_text = transcribe_audio("output_audio.wav")
    print(transcribed_text)
    # Prepare the conversation for AI feedback
    question = "Tell Us About The Biggest Challenge Youve Ever Faced"
    answer = transcribed_text
    conversations = [
        {
            "role": "system",
            "content": (
                "You are an expert interview preparation assistant. Your goal is to provide "
                "constructive feedback and suggestions for improvement when given interview "
                "questions and a user's transcribed audio response. Emphasize clarity, relevance, "
                "and professionalism in your feedback."
            )
        }
    ]
    request_message = "The question asked in the interview is this: "+str(question)+" The transcribed response is: "+str(answer)+" Provide feedback to improve my response to ace the interview."
    request_message_formatted = {'content': request_message, 'role': 'user'}
    conversations.append(request_message_formatted)

    # Generate a response using OpenAI GPT-3.5-turbo
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=conversations
    )

    # Get the AI's response
    ai_response = response.choices[0].message.content
    testResponse = "Testing just random stuff"
    print(ai_response)
    return ai_response

def process_video(video_path):
    # Extract audio from video
    extract_audio(video_path=video_path, audio_path="output_audio.wav")
    text = transcribe_audio("output_audio.wav")
    

    # Transcribe audio
    # transcription = transcribe_audio(audio_path)  # Implement this function based on your transcription logic
    
    # Additional processing...

@app.route('/request_chatgpt', methods=['POST'])
def chatgpt():

    request_message_formatted = {'content': request_message, 'role': 'user'}
    messages_to_send = read_chat(username) + [request_message_formatted]

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages_to_send
    )

    response_message_formatted = {'content': response.choices[0].message.content, 'role': 'assistant'}
    messages = [request_message_formatted]+[response_message_formatted]

    write_chat(username, messages)

@app.route('/write_chat', methods=['POST'])
def write_chat():
    # Get JSON data from the request
    data = request.json
    
    # Extract username and messages from the JSON data
    username = data.get('username')
    messages = data.get('messages', [])

    # Validate that both username and messages are present
    if not username or not messages:
        return jsonify({'error': 'Invalid request. Missing username or messages.'}), 400

    # Add messages to the chat in the database
    for message in messages:
        db.collection('users').document(username).collection('chat').add({'message': message})

    return jsonify({'success': True})

@app.route('/read_chat', methods=['GET'])
def read_chat():
    # Get username from the query parameters
    username = request.args.get('username')

    # Validate that username is present
    if not username:
        return jsonify({'error': 'Invalid request. Missing username.'}), 400

    # Retrieve messages from the chat in the database
    docs = db.collection('users').document(username).collection('chat').get()
    result = [doc.to_dict()['message'] for doc in docs]

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5002)
