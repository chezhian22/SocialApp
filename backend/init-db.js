const mysql = require("mysql2");

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "semma@2004",
    });

    connection.connect((err) => {
      if (err) {
        console.error("Error connecting to MySQL:", err);
        reject(err);
        return;
      }
      console.log("Connected to MySQL server...");

      // Create database if not exists
      const createDatabase = `CREATE DATABASE IF NOT EXISTS socialapp`;

      connection.query(createDatabase, (err) => {
        if (err) {
          console.error("Error creating database:", err);
          connection.end();
          reject(err);
          return;
        }
        console.log("Database 'socialapp' ensured...");

        // Switch to the database
        connection.changeUser({ database: "socialapp" }, (err) => {
          if (err) {
            console.error("Error switching to database:", err);
            connection.end();
            reject(err);
            return;
          }

          // Create tables
          const createTables = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') DEFAULT 'user',
            updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,

            // Posts table
            `CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`,

            // Likes table
            `CREATE TABLE IF NOT EXISTS likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            post_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            UNIQUE KEY unique_like (user_id, post_id)
          )`,

            // Comments table
            `CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            post_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
          )`,

            // Connections (Friend requests) table
            `CREATE TABLE IF NOT EXISTS connections (
            id INT AUTO_INCREMENT PRIMARY KEY,
            requester_id INT NOT NULL,
            receiver_id INT NOT NULL,
            status ENUM('Pending', 'accepted', 'rejected') DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_connection (requester_id, receiver_id)
          )`,

            // Messages table
            `CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
          )`,
          ];

          let completedQueries = 0;
          const totalQueries = createTables.length;

          createTables.forEach((query, index) => {
            connection.query(query, (err) => {
              if (err) {
                console.error(`Error creating table ${index + 1}:`, err);
              } else {
                console.log(`Table ${index + 1} ensured...`);
              }

              completedQueries++;
              if (completedQueries === totalQueries) {
                console.log("All tables created successfully!");
                connection.end();
                resolve();
              }
            });
          });
        });
      });
    });
  });
};

module.exports = initDatabase;
