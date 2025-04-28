import sqlite3
from sqlite3 import Connection

# Define the database path
DATABASE_URL = "documents.db"

# Connect to SQLite database
def get_db_connection() -> Connection:
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row  # This makes the rows return as dictionaries
    return conn

# Initialize the database and create the 'documents' table
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()

# CRUD operation: Add a document to the database
def add_document(title: str, content: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO documents (title, content) VALUES (?, ?)", (title, content))
    conn.commit()
    conn.close()

# CRUD operation: Get all documents from the database
def get_all_documents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents")
    rows = cursor.fetchall()
    conn.close()
    return rows

def update_document(document_id: int, title: str, content: str):
    # Example of an SQL query to update a document in the database
    conn = sqlite3.connect('documents.db')  # Connect to your SQLite database
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE documents
        SET title = ?, content = ? 
        WHERE id = ?
    """, (title, content, document_id))

    conn.commit()  # Save the changes
    conn.close()   # Close the database connection

    # Get a single document by its title
def get_document_by_id(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (id,))
    document = cursor.fetchone()  # Fetch one document (returns None if not found)
    conn.close()
    return document  # This will return a dictionary or None if not found

