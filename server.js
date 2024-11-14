const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the public folder
app.use(express.static('public'));

// Endpoint to handle PDF upload
app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Send the file path to the client to load the PDF
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Serve uploaded PDFs from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
