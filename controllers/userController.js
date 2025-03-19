// controllers/userController.js
const { createUser, getUserById } = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, mobileNumber, companyName, workEmail } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !mobileNumber || !companyName || !workEmail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const userId = await createUser({
            firstName,
            lastName,
            mobileNumber,
            companyName,
            workEmail
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { userId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user details',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    getUserDetails
};