// models/userModel.js
const { pool } = require('../config/database');

const createUser = async (userData) => {
    const { firstName, lastName, mobileNumber, companyName, workEmail } = userData;
    
    const query = `
        INSERT INTO users (first_name, last_name, mobile_number, company_name, work_email)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
        firstName, lastName, mobileNumber, companyName, workEmail
    ]);
    
    return result.insertId;
};

const getUserById = async (userId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    );
    
    return rows[0];
};

module.exports = {
    createUser,
    getUserById
};