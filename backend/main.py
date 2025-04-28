from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
from db import init_db, add_document, get_all_documents, update_document, get_document_by_id

# Initialize FastAPI
app = FastAPI()

init_db()

# CORS configuration
origins = [
    "http://localhost:3000",  # React frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests only from the frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Your OpenAI API key (set in environment variables for production)
openai.api_key = ""




@app.post("/generate/")
async def generate_material(request: Request):
    json_data = await request.json()

    prompt_type = json_data.get('prompt_type')
    input_text = json_data.get('input_text')
    extra = json_data.get('extra')
    print(input_text)
    print(extra)
    if prompt_type == "course_material":
        prompt = f"Create course material that closely defines {input_text} . If no specification, make an essay prompt and a quiz."
    elif prompt_type == "feedback":
        prompt = f"Provide detailed feedback (strengths and areas of improvement) on the following student essay:\n\n{input_text}. Extra Content: {extra}"
    elif prompt_type == "grade":
        prompt = f"Essay: {input_text}. Grade the following essay based on {extra} criteria. If no criteria provided, determine adequate categories. Provide a score and brief comments per category."
    else:
        return {"error": "Invalid prompt type."}

    # New OpenAI API call with the correct interface
    response = openai.chat.completions.create(
        model="gpt-4",  # or your desired model
        messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
        ],
        max_tokens=500,  # Adjust the max tokens based on your needs
        temperature=0.7,  # Optional: Adjust temperature for creativity (0-1)
    )

    generated_text = response.choices[0].message.content
    return {"result": generated_text}

# Endpoint to retrieve documents from the SQLite database
@app.get("/documents/")
async def get_documents():
    documents = get_all_documents()
    return {"documents": [{"id": doc["id"], "title": doc["title"]} for doc in documents]}

# Endpoint to add a new document to the SQLite database
@app.post("/documents/")
async def create_document(request: Request):
    json_data = await request.json()
    # Add the document to the database
    title = json_data.get('title')
    content = json_data.get('content')
    add_document(title, content)
    return {"message": "Document added successfully."}

@app.put("/documents/{document_id}/")
async def edit_document(document_id: int, request: Request):
    json_data = await request.json()
    title = json_data.get('title')
    content = json_data.get('content')

    # Update the document in the database (add your update logic)
    update_document(document_id, title, content)

    return {"message": "Document updated successfully."}

# Endpoint to retrieve a single document by its ID from the SQLite database
@app.get("/documents/{document_id}/")
async def get_single_document(document_id: int):
    document = get_document_by_id(document_id)
    if document:
        return {"id": document["id"], "title": document["title"], "content": document["content"]}
    else:
        return {"error": "Document not found"}