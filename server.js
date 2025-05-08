const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pose-analyzer.html'));
});

// API endpoint for pose analysis (placeholder for backend integration)
app.post('/api/analyze_pose', upload.single('frame'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // This would be where you'd process the image with a backend model
    // For now, we'll just return a mock response
    
    const mockResponse = {
        angles: {
            shoulder: Math.random() * 180,
            elbow: Math.random() * 180,
            knee: Math.random() * 180
        },
        posture: Math.random() > 0.7 ? 'bad' : 'good',
        confidence: Math.random()
    };
    
    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
    });
    
    res.json(mockResponse);
});

// API endpoint for repetition counting
app.post('/api/repetition_count', (req, res) => {
    const { angles, exerciseType } = req.body;
    
    if (!angles || !exerciseType) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Mock repetition counting logic
    const repCount = Math.floor(Math.random() * 10);
    
    res.json({ count: repCount });
});

// API endpoint for posture checking
app.post('/api/posture_check', (req, res) => {
    const { shoulderAngle, spineAngle } = req.body;
    
    if (!shoulderAngle || !spineAngle) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Mock posture check logic
    const isGoodPosture = Math.random() > 0.3;
    const feedback = isGoodPosture 
        ? 'Good posture' 
        : 'Poor posture detected. Try to straighten your back.';
    
    res.json({ 
        isGoodPosture, 
        feedback,
        improvements: isGoodPosture ? [] : ['Straighten back', 'Raise chin slightly']
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
