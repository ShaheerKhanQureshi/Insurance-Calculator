// routes/index.js
const express = require('express');
const userRoutes = require('./userRoutes');
const quotationRoutes = require('./quotationRoutes');
const leadRoutes = require('./leadsRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/quotation', quotationRoutes);
router.use('/', leadRoutes);


module.exports = router;