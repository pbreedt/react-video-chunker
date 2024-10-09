// Importing required modules
const express = require('express'); // Express.js for server setup
const bodyParser = require('body-parser'); // Body-parser to parse incoming request bodies
const cors = require('cors'); // CORS to allow cross-origin requests
const fs = require('fs') // File system to handle file operations
const md5 = require('md5') // MD5 to generate hash

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

// const path = '/Users/breedtp/dev/code/web-frontend/react/video-chunker-2/server';

// Route to upload file
app.post('/upload', (req, res) => {
  const { name, currentChunkIndex, totalChunks } = req.query; // Get query parameters

  const firstChunk = parseInt(currentChunkIndex) === 0; // Check if it's the first chunk
  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1; // Check if it's the last chunk

  const fileExtension = name.split('.').pop(); // Get file extension
  const data = req.body.toString().split(',')[1]; // Get data from request body
  const buffer = Buffer.from(data, 'base64'); // Convert data to buffer
//   const tempFilename = md5(name + req.ip + Math.random().toString('36').substring(0, 6))+ '.' + fileExtension; // Generate temporary filename
  const tempFilename = name; // Generate temporary filename

//   if (firstChunk) {
//     // If it's the first chunk, create a directory and a temporary file
//     console.log('First chunk');
//     fs.mkdirSync('./temp', { recursive: true });
//     fs.writeFileSync('./temp/'+tempFilename, buffer);
//   } else {
//     console.log('Not first chunk');
//     // Append current chunk data to file
//     fs.appendFileSync('./temp/'+tempFilename, buffer);
//   }
  console.log('Appended chunk to ', tempFilename);
  fs.appendFileSync('./temp/'+tempFilename, buffer);

  // If it's the last chunk, rename the file and send response
  if(lastChunk) {
      const finalFilename = md5(Math.random().toString('36')).substring(0, 6) + '.' + fileExtension;
      console.log('Last chunk. Renaming file:', tempFilename,' to ', finalFilename);
    fs.renameSync('./temp/'+tempFilename, './uploads/'+finalFilename);
    res.json({ message: 'File uploaded', finalFilename });
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