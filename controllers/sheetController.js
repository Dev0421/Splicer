const Sheet = require('../models/sheetModel');
const moment = require('moment');  // For managing datetime

// CREATE: Create a new sheet
exports.createSheet = (req, res) => {
  const { project_id, sheet_name, file_url, notes } = req.body;
  const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
  const updated_at = created_at;

  if (!project_id || !sheet_name || !file_url) {
    return res.status(400).json({ error: 'Project ID, sheet name, and file URL are required' });
  }

  Sheet.create(project_id, sheet_name, file_url, notes || '', created_at, updated_at, (err, lastID) => {
    if (err) return res.status(500).json({ error: 'Failed to create sheet' });
    res.status(201).json({ message: 'Sheet created successfully', sheet_id: lastID });
  });
};

// READ: Get all sheets
exports.getAllSheets = (req, res) => {
  Sheet.getAll((err, sheets) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sheets' });
    return res.status(200).json(sheets);
  });
};

// READ: Get sheet by ID
exports.getSheetById = (req, res) => {
  const { id } = req.params;

  Sheet.getById(id, (err, sheet) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sheet' });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
    return res.status(200).json(sheet);
  });
};

// UPDATE: Update sheet details
exports.updateSheet = (req, res) => {
  const { id } = req.params;
  const { project_id, sheet_name, file_url, notes } = req.body;
  const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

  if (!project_id || !sheet_name || !file_url) {
    return res.status(400).json({ error: 'Project ID, sheet name, and file URL are required' });
  }

  Sheet.update(id, project_id, sheet_name, file_url, notes || '', updated_at, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update sheet' });
    return res.status(200).json({ message: 'Sheet updated successfully' });
  });
};

// DELETE: Delete sheet by ID
exports.deleteSheet = (req, res) => {
  const { id } = req.params;

  Sheet.delete(id, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete sheet' });
    return res.status(200).json({ message: 'Sheet deleted successfully' });
  });
};
