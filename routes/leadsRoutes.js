const express = require('express');
const {
 getAllQuotations,
} = require('../controllers/leadscontroller');


const router = express.Router();

router.get('/quotations/all', getAllQuotations);


module.exports = router;