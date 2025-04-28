import { useState, useEffect } from 'react';
import './App.css';
import { input } from '@tensorflow/tfjs';

function App() {
  const [promptType, setPromptType] = useState('doc_add');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentContent, setNewDocumentContent] = useState('');
  const [editDocumentContent, setEditDocumentContent] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');  // New state for additional info
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [documentContent, setDocumentContent] = useState('');

  // Fetch documents from the database when the component mounts
  useEffect(() => {
      fetch('http://localhost:8000/documents/')
        .then(response => response.json())
        .then(data => setDocuments(data.documents))
        .catch(error => console.error('Error fetching documents:', error));

        setResult('');
        setAdditionalInfo('');
        setInputText('');
  }, [promptType]);

  useEffect(() => {
  if (selectedDocument) {
      // Fetch the content of the selected document based on its ID
      fetch(`http://localhost:8000/documents/${selectedDocument}/`)
        .then(response => response.json())
        .then(data => {
          // Set the content of the document into the textarea
          setEditDocumentContent(data.content || '');
          setDocumentContent(data.content || '');
        })
        .catch(error => console.error('Error fetching document content:', error));
    } else {
      // Reset content when no document is selected
      setEditDocumentContent('');
      setDocumentContent('');
    }
}, [selectedDocument, promptType]);

  const handleFeedbackSubmit = async () => {
    console.log(`The current input text is: ${inputText}`);
    const newPayload = {
        prompt_type: promptType,
        input_text: inputText,
        extra: additionalInfo
    };

    console.log(`The current selectedDocument is: ${selectedDocument}`);
    if (selectedDocument) {
        console.log(`The document content is: ${documentContent}`);
        newPayload.input_text = documentContent || '';
    }


    setResult("Loading");
    // Send request to the backend to generate content
    
    const response = await fetch('http://localhost:8000/generate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPayload),
    });
    
    const data = await response.json();
    setResult(data.result);
    
  };

  const handleMaterialSubmit = async () => {

    const newPayload = {
        prompt_type: promptType,
        input_text: inputText,
        extra: additionalInfo
    };
    setResult("Loading");
    // Send request to the backend to generate content
    
    const response = await fetch('http://localhost:8000/generate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPayload),
    });
    
    const data = await response.json();
    setResult(data.result);
    
  };

  // Handle adding a new document
  const handleNewDocumentSubmit = async () => {
    const isTitleExists = documents.some(doc => doc.title === newDocumentTitle);
  
    if (isTitleExists) {
        setAddError('This document already exists. Please choose a different title or edit the current.');
        return;  // Prevent submission if title exists
    }
    setAddError('');
    const newDocument = {
      title: newDocumentTitle,
      content: newDocumentContent
    };
    console.log(newDocument);
    // Post the new document to the backend
    const response = await fetch('http://localhost:8000/documents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDocument),
    });

    const data = await response.json();
    setDocuments(prevDocuments => [
        ...prevDocuments, 
        { id: data.id, title: newDocumentTitle, content: newDocumentContent }
      ]);
    setNewDocumentTitle('');
    setNewDocumentContent('');
  };

  // Handle editting document
  const handleDocumentEdit = async () => {
  
    if (!selectedDocument) {
        setEditError('No document selected. Please choose a document.');
        return;  // Prevent submission if title exists
    }
    setEditError('');
    console.log(selectedDocument)
    console.log(documents)
    const selectedDoc = documents.find(doc => doc.id === Number(selectedDocument));
    console.log(selectedDoc)
    const updatedDocument = {
        title: selectedDoc?.title, // Keep the title of the selected document
        content: editDocumentContent, // Only update the content
      };
    
    

    // Send a PUT request to the backend to update the document
    const response = await fetch(`http://localhost:8000/documents/${selectedDocument}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDocument),
    });

     // Check if the response is successful
    if (response.ok) {
        const data = await response.json();
        // Update the local documents state with the updated document
        setDocuments(prevDocuments =>
        prevDocuments.map(doc =>
            doc.id === selectedDocument
            ? { ...doc, title: doc.title, content: editDocumentContent }
            : doc
        )
        );
    } else {
        // Handle error if update failed
        setEditError("Problem with API")
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Teacher Document Analyzer</h1>

        <label>
          Select Task:
          <select value={promptType} onChange={(e) => setPromptType(e.target.value)}>
            <option value="doc_add">Add Document to DB</option>
            <option value="doc_edit">Edit Document</option>
            <option value="course_material">Create Course Material</option>
            <option value="feedback">Provide Feedback</option>
            <option value="grade">Grade Essay</option>
          </select>
        </label>

        <br /><br />
        {promptType === "doc_add" && (
            
          <div >
          <h2>Add New Document</h2>
          <div>
          <input
            type="text"
            placeholder="Document Title"
            value={newDocumentTitle}
            onChange={(e) => setNewDocumentTitle(e.target.value)}
          />
          </div>
          <br />
          <div>
          <textarea
            placeholder="Document Content"
            value={newDocumentContent}
            onChange={(e) => setNewDocumentContent(e.target.value)}
            rows={8}
            cols={50}
          />
          </div>
          {addError && <div style={{ color: 'red', fontSize: '14px' }}>{addError}</div>}  {/* Display error message */}
          <br />
          <button type="button" onClick={handleNewDocumentSubmit} 
          style={{
            fontSize: '20px',  // Increase font size
            padding: '10px 20px',  // Add more padding to make it bigger
            borderRadius: '5px',  // Optional: rounded corners
        }}>Add Document</button>
        </div>
        )}

        {promptType === "doc_edit" && (
            
            <div >
            <h2>Edit Current Document</h2>
            <div>
            <label>Select Document for Feedback:</label>
            </div>
            <div>
                <select value={selectedDocument || ""} onChange={(e) => setSelectedDocument(e.target.value)}>
              <option value="">Select a document</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
            </div>
            <br />
            <div>
            <textarea
              placeholder="Document Content"
              value={editDocumentContent}
              onChange={(e) => setEditDocumentContent(e.target.value)}
              rows={8}
              cols={50}
            />
            </div>
            {editError && <div style={{ color: 'red', fontSize: '14px' }}>{editError}</div>}  {/* Display error message */}
            <br />
            <button type="button" onClick={handleDocumentEdit} 
            style={{
              fontSize: '20px',  // Increase font size
              padding: '10px 20px',  // Add more padding to make it bigger
              borderRadius: '5px',  // Optional: rounded corners
          }}>Edit</button>
          </div>
          )}

        {promptType === "course_material" && (
            
            <div >
            <>
                <label>
                Course Material to Generate:
                <div>
                <textarea
                    placeholder="Enter material details here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    cols={50}
                />
                </div>
                </label>

                <br />
                <button type="button" onClick={handleMaterialSubmit} 
                style={{
                fontSize: '20px',  // Increase font size
                padding: '10px 20px',  // Add more padding to make it bigger
                borderRadius: '5px',  // Optional: rounded corners
            }}>Get Course Material</button>
            </>
          </div>
          )}

        {(promptType === "feedback" || promptType === "grade") && (
          <div>
            <label>Select Document for Feedback:</label>
            <select value={selectedDocument || ""} onChange={(e) => setSelectedDocument(e.target.value)}>
              <option value="">Input Text Document</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
            
            <br /><br />
            {!selectedDocument && (
            <>
                <label>
                <textarea
                    placeholder="Enter topic or paste student essay here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={10}
                    cols={50}
                />
                </label>
            </>
            )}

            <br /><br />
            {promptType === "feedback" && (
            <>
                <label>
                Additional Feedback Information (e.g., specific details):
                <textarea
                    placeholder="Enter additional feedback details here..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                    cols={50}
                />
                </label>
              
                <br />
                <button type="button" onClick={handleFeedbackSubmit} 
                style={{
                fontSize: '20px',  // Increase font size
                padding: '10px 20px',  // Add more padding to make it bigger
                borderRadius: '5px',  // Optional: rounded corners
            }}>Get Feedback</button>
            </>
            )}

            {promptType === "grade" && (
            <>
                <label>
                Grading Information (e.g., rubric, specific details):
                <textarea
                    placeholder="Enter grading details here..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                    cols={50}
                />
                </label>

                <br />
                <button type="button" onClick={handleFeedbackSubmit} 
                style={{
                fontSize: '20px',  // Increase font size
                padding: '10px 20px',  // Add more padding to make it bigger
                borderRadius: '5px',  // Optional: rounded corners
            }}>Get Grading</button>
            </>
            )}


            <br />
          </div>
        )}



      <div style={{ marginTop: "2rem" }}>
        <h2>Result:</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;
