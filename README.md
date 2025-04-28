# Document Analyzer

A tool that allows teachers to analyze documents and create curriculum.

## Features:
- View available documents
- Add/edit documents in database
- Analyze documents
- Get new curriculum

---

## 🖥 Setup Steps

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 2. Setup the Backend (FastAPI)

#### Install Python dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Run the FastAPI server
```bash
uvicorn main:app --reload --port 8000
```
This will start your backend server at [http://localhost:8000](http://localhost:8000).

---

### 3. Setup the Frontend (React)

#### Install Node dependencies
```bash
cd ../frontend
npm install
# or
yarn install
```

#### Run the React development server
```bash
npm start
# or
yarn start
```
The React app will open automatically at [http://localhost:3000](http://localhost:3000).

---
## Running containers

### 1. Clone the repository
```bash
git clone 
cd your-repo-name
```

---

### 2. Download Docker

---

### 3. Run Containers

#### Backend Container
```bash
cd backend
docker run -p 8000:8000 fastapi-backend

```

#### Frontend Container
```bash
cd frontend/app
docker run -p 3000:3000 react-frontend
```
The React app will open automatically at [http://localhost:3000](http://localhost:3000).

---



