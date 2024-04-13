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


if __name__ == "__main__":
    # delete_seekers_and_applied_jobs() # Delete all 'seekers' and their applied jobs
    # delete_collection(db.collection('jobs')) # Delete the entire 'jobs' collection
    # delete_collection(db.collection('admins')) # Delete the entire 'admins' collection
    # delete_recruiters_and_chats() # Delete the entire 'recruiters' and their chats
    add_jobs(jobs)
    #add_seekers(seekers)
    # add_admins(admins)
    # add_recruiters(recruiters)