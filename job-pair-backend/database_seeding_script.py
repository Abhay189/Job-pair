import firebase_admin
from firebase_admin import auth, credentials, firestore, initialize_app
from dummy_data import *

"""
This is the Database Seeding Script for jobpAIr. 
It includes functions to add jobs, seekers, recruiters, and admins to the database. 
Additionally, it provides methods to delete seekers and applied jobs, delete recruiters 
and their chat sub-collection, and delete all documents from the jobs and admins collections. 
The script interacts with the Firebase Admin SDK to perform database operations.
"""

cred = credentials.Certificate("jobpair-305bf-firebase-adminsdk-z1lyx-2330215fb7.json")
firebase_admin.initialize_app(cred)

db=firestore.client()

def add_jobs(jobs):
    # Get the total number of documents in the 'jobs' collection
    total_jobs = db.collection('jobs').stream()
    num_jobs = len(list(total_jobs))
    
    # Assign auto-incremented IDs to each job
    for i, job in enumerate(jobs, start=num_jobs + 1):
        job['id'] = i  
        db.collection('jobs').add(job)

def add_seekers(seekers):
    # Get the total number of documents in the 'seekers' collection
    total_seekers = db.collection('seekers').stream()
    num_seekers = len(list(total_seekers))

    for i, seeker in enumerate(seekers, start=num_seekers + 1):
        applied_jobs = seeker.pop("applied_jobs")
        seeker_ref = db.collection('seekers').document(seeker["name"])  
        seeker['id'] = i  # Add auto-incremented ID as a field
        seeker_ref.set(seeker)

        for job in applied_jobs:
            applied_jobs_ref = seeker_ref.collection("applied_jobs")
            job_ref = applied_jobs_ref.document()
            job_ref.set(job)

def add_recruiters(recruiters):
    # Get the total number of documents in the 'recruiters' collection
    total_recruiters = db.collection('recruiters').stream()
    num_recruiters = len(list(total_recruiters))
    
    # Assign auto-incremented IDs to each recruiter
    for i, recruiter in enumerate(recruiters, start=num_recruiters + 1):
        recruiter_ref = db.collection('recruiters').document(recruiter["name"])  
        recruiter_ref.set({
            "name": recruiter["name"],
            "email": recruiter["email"],
            "my_job_ids": recruiter["my_job_ids"],
            "id": i
        })
        
        # Add the 'chats' sub-collection
        chats_ref = recruiter_ref.collection('chats')
        for seeker, chat_data in recruiter.get("chats", {}).items():
            chat_doc_ref = chats_ref.document(seeker)
            chat_doc_ref.set(chat_data)

def add_admins(admins):
    # Get the total number of documents in the 'admins' collection
    total_admins = db.collection('admins').stream()
    num_admins = len(list(total_admins))

    for i, admin in enumerate(admins, start=num_admins + 1):
        admin_ref = db.collection('admins').document(admin["name"])
        admin["id"] = i
        admin_ref.set(admin)

def add_admins(admins):
    for admin in admins:
        db.collection('admins').add(admin)

def delete_collection(coll_ref):
    docs = coll_ref.stream()
    deleted = 0

    for doc in docs:
        doc.reference.delete()
        deleted += 1

    return deleted

def delete_seekers_and_applied_jobs():
    # Delete all documents in the 'seekers' collection
    seekers_ref = db.collection('seekers')
    
    # Delete all documents in the 'applied_jobs' subcollection within each seeker's document
    for seeker in seekers_ref.stream():
        applied_jobs_ref = seeker.reference.collection('applied_jobs')
        deleted_jobs = delete_collection(applied_jobs_ref)
        print(f'Deleted {deleted_jobs} documents from the "applied_jobs" subcollection of seeker {seeker.id}.')

    # Delete all documents in the 'seekers' collection
    deleted_seekers = delete_collection(seekers_ref)
    print(f'Deleted {deleted_seekers} documents from the "seekers" collection.')

def delete_recruiters_and_chats():
    # Delete all documents in the 'recruiters' collection
    recruiters_ref = db.collection('recruiters')

    # Delete the 'chats' sub-collection within each recruiter's document
    for recruiter in recruiters_ref.stream():
        chats_ref = recruiter.reference.collection('chats')
        deleted_chats = delete_collection(chats_ref)
        print(f'Deleted {deleted_chats} documents from the "chats" sub-collection of recruiter {recruiter.id}.')

    # Delete all documents in the 'recruiters' collection
    deleted_recruiters = delete_collection(recruiters_ref)
    print(f'Deleted {deleted_recruiters} documents from the "recruiters" collection.')


if __name__ == "__main__":
    # delete_seekers_and_applied_jobs() # Delete all 'seekers' and their applied jobs
    # delete_collection(db.collection('jobs')) # Delete the entire 'jobs' collection
    # delete_collection(db.collection('admins')) # Delete the entire 'admins' collection
    # delete_recruiters_and_chats() # Delete the entire 'recruiters' and their chats
    # add_jobs(jobs)
    add_seekers(seekers)
    # add_admins(admins)
    # add_recruiters(recruiters)