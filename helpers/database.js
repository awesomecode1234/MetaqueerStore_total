const mysql = require('mysql');

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
        this.connect();
        this.createTables();
    }

    connect() {
        try {
            this.connection.connect();
            console.log('Connected to MySQL database!');
        } catch (err) {
            console.error('Error connecting to MySQL database:', err);
        }
    }

    async createTables() {
        try {
            // Create tables if they do not exist
            await this.query(`CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstname VARCHAR(255) DEFAULT NULL,
                lastname VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) NOT NULL,
                avatar VARCHAR(255) DEFAULT NULL,
                art_name VARCHAR(255) DEFAULT NULL,
                description LONGTEXT DEFAULT NULL,
                phone VARCHAR(255) DEFAULT NULL,
                website VARCHAR(255) DEFAULT NULL,
                status TINYINT(1) DEFAULT 0
            )`);

            console.log('Tables created or already exist.');
        } catch (err) {
            console.error('Error creating tables:', err);
        }
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    close() {
        try {
            this.connection.end();
            console.log('Connection to MySQL database closed.');
        } catch (err) {
            console.error('Error closing MySQL database connection:', err);
        }
    }
}

module.exports = Database;
