# Job Pair Project

This project is designed to facilitate job matching between candidates and employers. It includes a backend, frontend, and necessary Docker configurations for deployment.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Database Schema & Seeding](#database-schema--seeding)

## Installation

To install and run the project, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/Job-pair.git
    ```

2. Navigate to the project directory:

    ```bash
    cd Job-pair
    ```

3. Build the Docker images:

    ```bash
    docker-compose build
    ```

## Usage

Once the installation is complete, you can start the project by running:

```bash
docker-compose up
```

This command will start both the backend and frontend servers. You can access the application at `http://localhost:3000`.

## Database Schema & Seeding

The database schema and seeding scripts are located in the `database_seeding_script.py` file within the `job-pair-backend` directory.

