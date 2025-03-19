// controllers/quotationController.js
const {
    createQuotation,
    saveHRPlanSelection,
    saveMaternityPlanSelection,
    updateHRLives,
    updateMaternityLives,
    calculateQuotation,
    submitQuotation,
    getQuotationDetails,
    getUserQuotationSummaries
} = require('../models/quotationModel');

const { calculateHRPlanDetails, calculateMaternityPlanDetails } = require('../services/calculationService');

// Step 1: Create Initial Quotation
const initiateQuotation = async (req, res) => {
    try {
        const { userId, includeMaternity } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const quotationId = await createQuotation(userId, includeMaternity);

        res.status(201).json({
            success: true,
            message: 'Quotation initiated successfully',
            data: { quotationId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating quotation',
            error: error.message
        });
    }
};

// Step 2: Save HR Plan Selection
const saveHRPlans = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { selectedPlans } = req.body;

        if (!Array.isArray(selectedPlans)) {
            return res.status(400).json({
                success: false,
                message: 'Selected plans must be an array'
            });
        }

        await saveHRPlanSelection(quotationId, selectedPlans);

        res.status(200).json({
            success: true,
            message: 'HR plans saved successfully',
            data: { selectedPlans }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving HR plans',
            error: error.message
        });
    }
};

// Step 3: Save Maternity Plan Selection
const saveMaternityPlans = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { selectedPlans } = req.body;

        if (!Array.isArray(selectedPlans)) {
            return res.status(400).json({
                success: false,
                message: 'Selected plans must be an array'
            });
        }

        await saveMaternityPlanSelection(quotationId, selectedPlans);

        res.status(200).json({
            success: true,
            message: 'Maternity plans saved successfully',
            data: { selectedPlans }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving maternity plans',
            error: error.message
        });
    }
};

// Step 4: Update HR Lives
const updateHRPlanLives = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { planLives } = req.body;

        const calculatedData = calculateHRPlanDetails(planLives);
        await updateHRLives(quotationId, calculatedData);

        res.status(200).json({
            success: true,
            message: 'HR lives updated successfully',
            data: calculatedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating HR lives',
            error: error.message
        });
    }
};

// Step 5: Update Maternity Lives
const updateMaternityPlanLives = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { planLives } = req.body;

        const calculatedData = calculateMaternityPlanDetails(planLives);
        await updateMaternityLives(quotationId, calculatedData);

        res.status(200).json({
            success: true,
            message: 'Maternity lives updated successfully',
            data: calculatedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating maternity lives',
            error: error.message
        });
    }
};

// Step 6: Calculate Quotation
const calculateQuotationDetails = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const calculation = await calculateQuotation(quotationId);

        res.status(200).json({
            success: true,
            data: calculation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating quotation',
            error: error.message
        });
    }
};

// Step 7: Submit Final Quotation
const submitFinalQuotation = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const finalData = await submitQuotation(quotationId);

        res.status(200).json({
            success: true,
            message: 'Quotation submitted successfully',
            data: finalData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting quotation',
            error: error.message
        });
    }
};


const getQuotationSummary = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const summary = await getQuotationDetails(quotationId);

        if (!summary) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: summary // summary now contains children_count as well
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching quotation details',
            error: error.message
        });
    }
};

// Get all quotations for a specific user
const getAllUserQuotations = async (req, res) => {
    try {
        const { userId } = req.params;
        const quotations = await getUserQuotationSummaries(userId);

        if (!quotations.length) {
            return res.status(404).json({
                success: false,
                message: 'No quotations found for this user'
            });
        }

        res.status(200).json({
            success: true,
            message: "User quotations retrieved successfully",
            data: {
                user_id: userId,
                total_quotations: quotations.length,
                quotations: quotations
            }
        });
    } catch (error) {
        console.error('Error fetching user quotations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user quotations',
            error: error.message
        });
    }
};


module.exports = {
    initiateQuotation,
    saveHRPlans,
    saveMaternityPlans,
    updateHRPlanLives,
    updateMaternityPlanLives,
    calculateQuotationDetails,
    submitFinalQuotation,
    getQuotationSummary,
    getAllUserQuotations
};