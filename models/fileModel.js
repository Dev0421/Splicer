const db = require('../config/db');

class FileModel {
    static async insertFile(fileData) {
        const { name, url, size, enclosure_id, user_id } = fileData;
        const query = `INSERT INTO files (name, url, size, enclosure_id, user_id) VALUES (?, ?, ?, ?, ?)`;

        return new Promise((resolve, reject) => {
            db.run(query, [name, url, size, enclosure_id, user_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID }); // SQLite returns last inserted ID
                }
            });
        });
    }

    static async getFileById(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM files WHERE id = ?`;
            db.get(query, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching file by ID:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static async getFileByEncId(id) {
        console.log("I'm going to fetch with id ", id);
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM files WHERE enclosure_id = ?`;
            db.all(query, [id], (err, rows) => {
                if (err) {
                    console.error('Error fetching files by enclosure ID:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async deleteFileById(id) {
        const query = `DELETE FROM files WHERE id = ?`;
        return db.run(query, [id]);
    }
}

module.exports = FileModel;
