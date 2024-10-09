// Importing required modules
const express = require('express'); // Express.js for server setup
const bodyParser = require('body-parser'); // Body-parser to parse incoming request bodies
const cors = require('cors'); // CORS to allow cross-origin requests
const fs = require('fs') // File system to handle file operations

// Setting up the port number
const PORT = 4000;

// Creating an Express application
const app = express();

// Using middleware
app.use(cors()); // Enable All CORS Requests
app.use(express.json()); // Parse JSON request bodies
app.use('/uploads', express.static('uploads')); // Serve static files from 'uploads' directory

// Parse incoming raw data
app.use(bodyParser.raw({
  type: 'application/octet-stream',
  limit: '100mb'
}));

// Route to upload file
app.post('/upload', (req, res) => {
  const { filename, currentChunkIndex, totalChunks } = req.query; // Get query parameters

  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1; // Check if it's the last chunk
  const data = req.body.toString().split(',')[1]; // Get data from request body
  const buffer = Buffer.from(data, 'base64'); // Convert data to buffer

  console.log(`Appended chunk to ./temp/${filename}`);
  fs.appendFileSync('./temp/'+filename, buffer);

  // If it's the last chunk, rename the file and send response
  if(lastChunk) {
      console.log(`Last chunk. Renaming file: ./temp/${filename} to ./uploads/${filename}`);
    fs.renameSync('./temp/'+filename, './uploads/'+filename);
    res.json({ message: 'File uploaded', filename });
  } else {
    // If it's not the last chunk, send response
    res.status(200).json({
      message: 'Chunk uploaded',
      currentChunkIndex,
      totalChunks
    });
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})