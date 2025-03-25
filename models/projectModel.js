const db = require('../config/db');

class Project {
  static create(data, callback) {
    // Destructuring data object to extract values
    const { 
      title, 
      company, 
      file_src,  // Ensure this is passed in the data object
      date, 
      tech, 
      location_id, 
      enclosure_id, 
      enclosure_type, 
      road_name, 
      lat_long, 
      notes 
    } = data;

    // Check if 'file_src' is missing and handle the error
    if (!file_src) {
      return callback(new Error("file_src is required"), null);
    }
    
    console.log(data); // Debugging log for checking data

    // Prepare the SQL query for inserting a new project
    db.run(
      `INSERT INTO projects (title, company, file_src, date, tech, location_id, enclosure_id, enclosure_type, road_name, lat_long, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, file_src, date, tech, location_id, enclosure_id, enclosure_type, road_name, lat_long, notes],
      function (err) {
        if (err) {
          return callback(err, null);
        }
        // Retrieve the newly created record
        db.get(`SELECT * FROM projects WHERE id = ?`, [this.lastID], (err, row) => {
          if (err) {
            return callback(err, null);
          }
          callback(null, row);
        });
      }
    );
  }

  static getAll(callback) {
    db.all(`SELECT * FROM projects`, [], (err, rows) => {
      callback(err, rows);
    });
  }

  static getById(id, callback) {
    db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, row) => {
      callback(err, row);
    });
  }

  static update(id, data, callback) {
    console.log("This is for Update");
    console.log(data);
    const { title, company, file_src, date, tech, location_id, enclosure_id, enclosure_type, road_name, lat_long, notes } = data;
    console.log(file_src);
    db.run(
      `UPDATE projects SET 
       title = ?, company = ?, file_src=?, date=?, tech = ?, location_id = ?, enclosure_id = ?, enclosure_type = ?, 
       road_name = ?, lat_long = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, company, file_src, date, tech, location_id, enclosure_id, enclosure_type, road_name, lat_long, notes, id],
      function (err) {
        callback(err, { id, ...data });
      }
    );
  }

  static delete(id, callback) {
    db.run(`DELETE FROM projects WHERE id = ?`, [id], (err) => {
      callback(err, { message: "Project deleted successfully", id });
    });
  }

  static search(query, callback) {
    console.log(query);
    const searchQuery = `%${query}%`;
    console.log(searchQuery);
    db.all(
      `SELECT * FROM projects WHERE company LIKE ? title LIKE ? OR tech LIKE ? OR road_name LIKE ?`,
      [searchQuery, searchQuery, searchQuery, searchQuery],
      (err, rows) => {
        callback(err, rows);
      }
    );
  }
}

module.exports = Project;