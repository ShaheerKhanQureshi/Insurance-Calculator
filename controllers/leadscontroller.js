
const {
    getAllQuotationSummaries
} = require('../models/leadsmodel');

const getAllQuotations = async (req, res) => {
    try {
        const allUsersWithQuotations = await getAllQuotationSummaries();
        
        console.log('Quotations fetched:', allUsersWithQuotations);  // Log the data

        if (!allUsersWithQuotations || allUsersWithQuotations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: "All users and their quotations retrieved successfully",
            data: {
                total_users: allUsersWithQuotations.length,
                users: allUsersWithQuotations
            }
        });
    } catch (error) {
        console.error('Error in getAllQuotations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users and quotations',
            error: error.message
        });
    }
};

module.exports = {
    getAllQuotations
    };