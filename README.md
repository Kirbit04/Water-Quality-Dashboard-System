# Aqualitcs — Water Quality Dashboard System

A data-driven web application that monitors, analyzes, and classifies water quality levels, providing actionable recommendations on sustainable water treatment methods.

---

## Overview

Aqualitcs allows users to input water quality parameters such as pH, turbidity, fluoride, nitrates, and dissolved oxygen. The system analyzes the data, classifies water as **safe**, **moderately safe**, or **unsafe** using a machine learning model, and displays interactive dashboard visualizations alongside treatment recommendations.

---

## Prerequisites

Make sure you have the following installed before setting up the project:

- [Python 3.12.5](https://www.python.org/downloads/)
- [Node.js v24.13.0](https://nodejs.org/)
- pip (latest)
- MySQL

---

## Project Structure

```
aqualitcs/
├── aqua-guard/          # React frontend (Vite)
└── backend/
    ├── app/
    │   ├── api/         # Route handlers (auth, recommendations, etc.)
    │   ├── core/        # Settings and database connection
    │   ├── ml/          # Machine learning model, model artifacts and pipeline 
    │   ├── domain/      # Models and schemas
    │   └── services/    # Repository and service layer
    ├── main.py
    └── requirements.txt
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/aqualitcs.git
cd Water Quality Dashboard System
```

### 2. Backend Setup

Navigate into the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv aquavenv
```

Activate the virtual environment:

- **Windows:**
  ```bash
  aquavenv\Scripts\activate
  ```
- **Mac/Linux:**
  ```bash
  source aquavenv/bin/activate
  ```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your database — open `app/core/settings.py` and update the following with your MySQL credentials:

```python
DB_HOST = "localhost"
DB_USER = "your_mysql_username"
DB_PASSWORD = "your_mysql_password"
DB_NAME = "aquaguard"
```

### 3. Frontend Setup

Open a new terminal and navigate into the frontend folder:

```bash
cd aqua-guard
```

Install dependencies:

```bash
npm install
```

---

## Running the Application

### Start the backend

From the `backend/` directory with `aquavenv` activated:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000--reload
```

The API will be available at `http://localhost:8000`

### Start the frontend

From the `aqua-guard/` directory:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Features

- Secure user registration and login
- Input and manage water quality parameters (pH, turbidity, fluoride, nitrates, dissolved oxygen)
- Interactive dashboard with data visualizations and trend monitoring
- Water quality classification — safe, moderately safe, or unsafe — powered by a machine learning model
- Actionable recommendations for sustainable water treatment methods

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) |
| Backend | FastAPI |
| Database | MySQL |
| ML | Scikit-learn |

---

## License

This project was developed as a final year research project at the Catholic University of Eastern Africa.
