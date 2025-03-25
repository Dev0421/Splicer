const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFile, downloadFile, deleteFile, getNamesFile } = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware'); // Authentication middleware

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// File upload route
router.post('/upload', authMiddleware, upload.single('file'), (req, res, next) => {
    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }
    req.userId = userId;

    const enclosure_id = req.body.enclosure_id;
    if (!enclosure_id) {
        return res.status(400).json({ error: 'enclosure_id is required' });
    }
    req.enclosure_id = enclosure_id;

    next();
}, uploadFile);

// Fix: Correctly call getNamesFile
router.post('/getnames', authMiddleware, (req, res, next) => {
    console.log("Start");
    const userId = req.body.userId;
    req.userId = userId; 
    const enclosure_id = req.body.enclosure_id;
    req.enclosure_id = enclosure_id; 
    next();
}, getNamesFile);

router.get('/download/:id', authMiddleware, downloadFile);
router.delete('/delete/:id', authMiddleware, deleteFile);

module.exports = router;
