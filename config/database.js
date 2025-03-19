// // config/database.js
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// const connectToDatabase = async () => {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Connected to MySQL database');
//         connection.release();
//         return true;
//     } catch (error) {
//         console.error('Database connection error:', error);
//         throw error;
//     }
// };

// module.exports = {
//     pool,
//     connectToDatabase
// };

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectToDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

// Gracefully close the database connection pool
const closeDatabaseConnection = async () => {
    try {
        await pool.end();
        console.log('MySQL database connection pool closed');
    } catch (error) {
        console.error('Error closing MySQL database connection pool:', error);
    }
};

module.exports = {
    pool,
    connectToDatabase,
    closeDatabaseConnection
};
