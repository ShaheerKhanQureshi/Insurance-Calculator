// routes/quotationRoutes.js
const express = require('express');
const {
    initiateQuotation,
    saveHRPlans,
    saveMaternityPlans,
    updateHRPlanLives,
    updateMaternityPlanLives,
    calculateQuotationDetails,
    submitFinalQuotation,
    getQuotationSummary,
    getAllUserQuotations
} = require('../controllers/quotationController');

const router = express.Router();

// Step 1: Initiate quotation
router.post('/', initiateQuotation);

// Step 2: Save HR plan selection
router.post('/:quotationId/hr-plans', saveHRPlans);

// Step 3: Save maternity plan selection
router.post('/:quotationId/maternity-plans', saveMaternityPlans);

// Step 4: Update HR lives
router.put('/:quotationId/hr-lives', updateHRPlanLives);

// Step 5: Update maternity lives
router.put('/:quotationId/maternity-lives', updateMaternityPlanLives);

// Step 6: Calculate quotation
router.get('/:quotationId/calculate', calculateQuotationDetails);

// Step 7: Submit final quotation
router.post('/:quotationId/submit', submitFinalQuotation);

// Get quotation summary
router.get('/:quotationId', getQuotationSummary);

// Get all quotations for a specific user
router.get('/user/:userId', getAllUserQuotations);

module.exports = router;