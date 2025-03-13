const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure "uploads" folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create uploads folder if not exists
    console.log('✅ "uploads" folder created.');
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware to serve static files (for testing)
app.use(express.static('public'));

// HTML Upload Form (for testing)
app.get('/', (req, res) => {
    res.send(`
        <h2>File Upload Test</h2>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file">
            <button type="submit">Upload</button>
        </form>
    `);
});

// Handle File Uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('❌ No file uploaded.');
    }

    console.log('📂 Uploaded file:', req.file); // Debugging log

    res.send(`✅ File uploaded successfully! Saved as: ${req.file.filename}`);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('🚨 Error:', err); // Log error in console

    if (err instanceof multer.MulterError) {
        return res.status(400).send(`Multer Error: ${err.message}`);
    } else if (err) {
        return res.status(400).send(`Error: ${err.message}`);
    }
    next();
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
