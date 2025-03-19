// routes/userRoutes.js
const express = require('express');
const { registerUser, getUserDetails } = require('../controllers/userController');

const router = express.Router();

router.post('/', registerUser);
router.get('/:userId', getUserDetails);

module.exports = router;