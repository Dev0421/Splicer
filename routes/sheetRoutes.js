const express = require('express');
const { createSheet, getAllSheets, getSheetById, updateSheet, deleteSheet } = require('../controllers/sheetController');
const authMiddleware = require('../middlewares/authMiddleware');  // Authentication middleware

const router = express.Router();

// Routes for Sheets (Protected with Authentication)
router.post('/', authMiddleware, createSheet);
router.get('/', authMiddleware, getAllSheets);
router.get('/:id', authMiddleware, getSheetById);
router.put('/:id', authMiddleware, updateSheet);
router.delete('/:id', authMiddleware, deleteSheet);

module.exports = router;
