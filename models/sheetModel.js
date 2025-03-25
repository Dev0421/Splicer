const db = require('../config/db');

const Sheet = {
  create: (project_id, sheet_name, file_url, notes, created_at, updated_at, callback) => {
    const query = 'INSERT INTO sheets (project_id, sheet_name, file_url, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(query, [project_id, sheet_name, file_url, notes, created_at, updated_at], function (err) {
      callback(err, this.lastID);  // Returns the ID of the new sheet
    });
  },

  getAll: (callback) => {
    const query = 'SELECT * FROM sheets';
    db.all(query, [], callback);
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM sheets WHERE id = ?';
    db.get(query, [id], callback);
  },

  update: (id, project_id, sheet_name, file_url, notes, updated_at, callback) => {
    const query = 'UPDATE sheets SET project_id = ?, sheet_name = ?, file_url = ?, notes = ?, updated_at = ? WHERE id = ?';
    db.run(query, [project_id, sheet_name, file_url, notes, updated_at, id], function (err) {
      callback(err);
    });
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM sheets WHERE id = ?';
    db.run(query, [id], function (err) {
      callback(err);
    });
  },
};

module.exports = Sheet;
