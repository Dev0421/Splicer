const FileModel = require('../models/fileModel');
const moment = require('moment');  // For managing datetime
const path = require('path');
const fs = require('fs');


exports.uploadFile = async (req, res) => {
  try {
      const userId = req.userId; // Retrieve userId from the request object
      const enclosure_id = req.body.enclosure_id; // Retrieve enclosure_id from request body
      const file = req.file;

      console.log(enclosure_id, userId);

      if (!file) {
          return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileData = {
          name: file.originalname,
          url: path.join('/uploads', file.filename),
          size: file.size,
          enclosure_id,
          user_id: userId
      };
      
      // Insert file and get the inserted file ID
      const insertedFile = await FileModel.insertFile(fileData);

      if (!insertedFile || !insertedFile.id) {
          return res.status(500).json({ message: 'Failed to insert file into the database' });
      }

      const fileId = insertedFile.id;

      res.status(201).json({ 
          message: 'File uploaded successfully', 
          userId, 
          fileName: file.filename, 
          fileId 
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// READ: Get sheet by ID
exports.getNamesFile = async (req, res) => {
  console.log("hiya");
    try {
        const userId = req.userId; // Retrieve userId from the request object
        const enclosure_id = req.enclosure_id; // Retrieve enclosure_id from the request object
        console.log(`Fetching files for enclosure_id: ${enclosure_id}, userId: ${userId}`);
        const files = await FileModel.getFileByEncId(enclosure_id);
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files found for the given enclosure ID' });
        }

        res.status(200).json({ message: 'Files retrieved successfully', files });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Download file handler
exports.downloadFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        if (!fileId) {
            return res.status(400).send('File ID is required');
        }
        console.log(fileId);
        
        // Fetch file details from the database
        const fileDetails = await FileModel.getFileById(fileId);
        if (!fileDetails || !fileDetails.url) {
            return res.status(404).send('File not found');
        }
        console.log(fileDetails);

        // Correct the file path to avoid double 'uploads'
        const filePath = path.join(__dirname, '..', fileDetails.url);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err.message);
                res.status(500).send('Error downloading file');
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal server error');
    }
};

// Delete file handler
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch file metadata from the database
        const file = await FileModel.getFileById(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '..', file.url);

        // Delete the file from storage
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the file record from the database
        await FileModel.deleteFileById(id);

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
