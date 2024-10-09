// Importing necessary libraries and hooks from React and axios
import { useState, useEffect } from "react";
import './App.css';
import MediaThemeSutro from 'player.style/sutro/react';

const md5 = require('md5')

function App() {
  // State variables for the file and the current chunk index
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(null);

  // Constant for the chunk size (1MB)
  const chunkSize = 1024 * 1024 * 1;

  // Function to handle the start of the upload
  function handleUpload(e) {
    e.preventDefault();
    setCurrentChunkIndex(0)
  }

  // useEffect hook to handle the file upload
  useEffect(() => {
    // Function to upload a chunk of the file
    async function uploadChunk(readerEvent) {
      if (!file) return;
      const data = readerEvent.target.result;

      // Set up the parameters for the request
      const params = new URLSearchParams();
      params.set('filename', filename);
      params.set('currentChunkIndex', currentChunkIndex);
      params.set('totalChunks', Math.ceil(file.size / chunkSize));

      // Set up the headers for the request
      const headers = { 'Content-Type': 'application/octet-stream' };
      const url = 'http://localhost:4000/upload?' + params.toString()
      console.log("POSTing: ",url);

      // Make the POST request to the server
      fetch(url, {
        method: 'POST',
        headers: headers,
        body: data
      }).then(response => response.json())
        .then(res => {
          // Check if this is the last chunk
          const isLastChunk = currentChunkIndex === Math.ceil(file.size / chunkSize) - 1;
          // If it is, set the final filename and reset the current chunk index
          if (isLastChunk) {
            file.finalFilename = res.filename;
            setCurrentChunkIndex(null);
          } else {
            // If it's not, increment the current chunk index
            setCurrentChunkIndex(currentChunkIndex + 1);
          }
        });
    }

    // Function to read and upload the current chunk
    function readAndUploadCurrentChunk() {
      if (!file) return;
      console.log("Read and upload current chunk idx", currentChunkIndex);
      
      // Calculate the start and end of the current chunk
      const from = currentChunkIndex * chunkSize;
      const to = (currentChunkIndex + 1) * chunkSize >= file.size ? file.size : from + chunkSize;

      // Slice the file to get the current chunk
      const blob = file.slice(from, to);

      const reader = new FileReader();
      // Set the onload function to upload the chunk when it's read
      reader.onload = e => uploadChunk(e);
      // Read the blob as a data URL
      reader.readAsDataURL(blob);
    }

    if (file != null && filename === null) {
      setFilename(md5(Math.random().toString('36')).substring(0, 6)+'.'+file.name.split('.').pop());
    }

    // If a chunk index is set, read and upload the current chunk
    if (currentChunkIndex != null) readAndUploadCurrentChunk();
  }, [chunkSize, currentChunkIndex, file, filename])

  // Render the component
  return (
    <div className={'main'}>
      <input  className={`input`} type="file" multiple={false}
        onChange={e => { setFile(e.target.files[0]) }}
      />
      <button onClick={(e) => handleUpload(e)} className={'button'}>
        Upload
      </button>
      <div className="files">
        {file && (
          <>
            <div>{ file.finalFilename ?
            '100%' :
             (<>{Math.round(currentChunkIndex / Math.ceil(file.size / chunkSize) * 100)}%</>)
            }</div>
            <div className="name">
              <a
                className="file"
                target="_blank"
                href={file.finalFilename ? 'http://localhost:4000/uploads/' + file.finalFilename : null}
                rel="noreferrer">
                  {file.name}
              </a>
            </div>
          </>
        )}
      </div>

      <div className="footer">
        {file && file.finalFilename && (
          <MediaThemeSutro>
          <video
            slot="media"
            src={'http://localhost:4000/uploads/' + file.finalFilename}
            playsInline
            crossOrigin="anonymous"
          ></video>
        </MediaThemeSutro>
        )}
      </div>

    </div>
  );
}

export default App;