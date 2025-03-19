// models/quotationModel.js
const { pool } = require('../config/database');

const createQuotation = async (userId, includeMaternity = false) => {
    const [result] = await pool.execute(
        'INSERT INTO quotations (user_id, include_maternity) VALUES (?, ?)',
        [userId, includeMaternity]
    );
    return result.insertId;
};

const saveHRPlanSelection = async (quotationId, selectedPlans) => {
    const [result] = await pool.execute(
        'INSERT INTO plan_selections (quotation_id, plan_type, selected_plans) VALUES (?, ?, ?)',
        [quotationId, 'hr', JSON.stringify(selectedPlans)]
    );
    return result.insertId;
};

const saveMaternityPlanSelection = async (quotationId, selectedPlans) => {
    const [result] = await pool.execute(
        'INSERT INTO plan_selections (quotation_id, plan_type, selected_plans) VALUES (?, ?, ?)',
        [quotationId, 'maternity', JSON.stringify(selectedPlans)]
    );
    return result.insertId;
};

const updateHRLives = async (quotationId, calculatedData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Delete existing HR plans for this quotation
        await connection.execute(
            'DELETE FROM hr_plans WHERE quotation_id = ?',
            [quotationId]
        );

        // Insert new HR plans
        for (const [planType, planData] of Object.entries(calculatedData.plan_details)) {
            for (const ageBand of planData.age_band_details) {
                await connection.execute(
                    `INSERT INTO hr_plans 
                    (quotation_id, plan_type, age_band, number_of_lives, premium_rate, calculated_premium)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        quotationId,
                        planType,
                        ageBand.age_band,
                        ageBand.number_of_lives,
                        ageBand.premium_rate,
                        ageBand.calculated_premium
                    ]
                );
            }
        }

        // Update calculations table
        await connection.execute(
            `INSERT INTO calculations 
            (quotation_id, hr_total_lives, hr_total_premium, waiver_percentage)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            hr_total_lives = VALUES(hr_total_lives),
            hr_total_premium = VALUES(hr_total_premium),
            waiver_percentage = VALUES(waiver_percentage)`,
            [
                quotationId,
                calculatedData.overall_totals.total_lives,
                calculatedData.overall_totals.total_premium,
                calculatedData.waiver_percentage
            ]
        );

        await connection.commit();
        return calculatedData;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateMaternityLives = async (quotationId, calculatedData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Delete existing maternity plans for this quotation
        await connection.execute(
            'DELETE FROM maternity_plans WHERE quotation_id = ?',
            [quotationId]
        );

        // Insert new maternity plans
        for (const [planType, planData] of Object.entries(calculatedData.plan_details)) {
            for (const ageBand of planData.age_band_details) {
                await connection.execute(
                    `INSERT INTO maternity_plans 
                    (quotation_id, plan_type, age_band, number_of_spouses, premium_rate, calculated_premium)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        quotationId,
                        planType,
                        ageBand.age_band,
                        ageBand.number_of_spouses,
                        ageBand.premium_rate,
                        ageBand.calculated_premium
                    ]
                );
            }
        }

        // Update calculations table
        await connection.execute(
            `UPDATE calculations 
            SET maternity_total_lives = ?,
                maternity_total_premium = ?,
                maternity_coverage_status = ?
            WHERE quotation_id = ?`,
            [
                calculatedData.overall_totals.total_spouses,
                calculatedData.overall_totals.total_premium,
                calculatedData.coverage_details.coverage_status,
                quotationId
            ]
        );

        await connection.commit();
        return calculatedData;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const calculateQuotation = async (quotationId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM calculations WHERE quotation_id = ?`,
        [quotationId]
    );
    return rows[0];
};

const submitQuotation = async (quotationId) => {
    await pool.execute(
        'UPDATE quotations SET status = ? WHERE id = ?',
        ['submitted', quotationId]
    );

    return getQuotationDetails(quotationId);
};

// const getQuotationDetails = async (quotationId) => {
//     const [quotation] = await pool.execute(
//         `SELECT q.*, u.*, c.*
//         FROM quotations q
//         JOIN users u ON q.user_id = u.id
//         LEFT JOIN calculations c ON q.id = c.quotation_id
//         WHERE q.id = ?`,
//         [quotationId]
//     );

//     if (!quotation[0]) return null;

//     const [hrPlans] = await pool.execute(
//         'SELECT * FROM hr_plans WHERE quotation_id = ?',
//         [quotationId]
//     );

//     const [maternityPlans] = await pool.execute(
//         'SELECT * FROM maternity_plans WHERE quotation_id = ?',
//         [quotationId]
//     );

//     return {
//         quotation: quotation[0],
//         hr_plans: hrPlans,
//         maternity_plans: maternityPlans
//     };
// };

const getQuotationDetails = async (quotationId) => {
    const [quotation] = await pool.execute(
        `SELECT q.*, u.*, c.*
        FROM quotations q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN calculations c ON q.id = c.quotation_id
        WHERE q.id = ?`,
        [quotationId]
    );

    if (!quotation[0]) return null;

    const [hrPlans] = await pool.execute(
        'SELECT * FROM hr_plans WHERE quotation_id = ?',
        [quotationId]
    );

    const [maternityPlans] = await pool.execute(
        'SELECT * FROM maternity_plans WHERE quotation_id = ?',
        [quotationId]
    );

    // Query to count children in the 0-17 age band from the hr_plans table
    const [childrenCountResult] = await pool.execute(
        `SELECT SUM(number_of_lives) AS children_count
        FROM hr_plans
        WHERE quotation_id = ? AND age_band = '0-17'`,
        [quotationId]
    );

    const childrenCount = childrenCountResult[0]?.children_count || 0;

    // Count the total number of hr_plans
    const [totalHrPlansResult] = await pool.execute(
        `SELECT COUNT(*) AS total_hr_plans
        FROM hr_plans
        WHERE quotation_id = ?`,
        [quotationId]
    );

    const totalHrPlans = totalHrPlansResult[0]?.total_hr_plans || 0;

    // Count the total number of maternity_plans
    const [totalMaternityPlansResult] = await pool.execute(
        `SELECT COUNT(*) AS total_maternity_plans
        FROM maternity_plans
        WHERE quotation_id = ?`,
        [quotationId]
    );

    const totalMaternityPlans = totalMaternityPlansResult[0]?.total_maternity_plans || 0;

    return {
        quotation: quotation[0],
        hr_plans: hrPlans,
        maternity_plans: maternityPlans,
        children_count: childrenCount, // Add children count to the response
        total_hr_plans: totalHrPlans, // Add total number of HR plans
        total_maternity_plans: totalMaternityPlans // Add total number of Maternity plans
    };
};


const getUserQuotationSummaries = async (userId) => {
    const connection = await pool.getConnection();
    try {
        // First check if user exists
        const [user] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
  
        if (!user.length) {
            throw new Error('User not found');
        }
  
        // Get all quotations for the user
        const [quotations] = await connection.execute(`
            SELECT 
                q.id as quotation_id,
                q.status,
                q.include_maternity,
                q.created_at,
                c.hr_total_lives,
                c.hr_total_premium,
                c.maternity_total_lives,
                c.maternity_total_premium,
                c.waiver_percentage,
                c.maternity_coverage_status
            FROM quotations q
            LEFT JOIN calculations c ON q.id = c.quotation_id
            WHERE q.user_id = ?
            ORDER BY q.created_at DESC
        `, [userId]);
  
        // Get details for each quotation
        const quotationsWithDetails = await Promise.all(quotations.map(async (quotation) => {
            const [hrPlans] = await connection.execute(`
                SELECT 
                    plan_type,
                    age_band,
                    number_of_lives,
                    premium_rate,
                    calculated_premium
                FROM hr_plans
                WHERE quotation_id = ?
            `, [quotation.quotation_id]);
  
            const [maternityPlans] = await connection.execute(`
                SELECT 
                    plan_type,
                    age_band,
                    number_of_spouses,
                    premium_rate,
                    calculated_premium
                FROM maternity_plans
                WHERE quotation_id = ?
            `, [quotation.quotation_id]);
  
            // Summing HR Plans' total premium correctly
            const hrPlansTotalPremium = hrPlans.reduce((sum, plan) => sum + parseFloat(plan.calculated_premium || 0), 0).toFixed(2);
  
            // Summing Maternity Plans' total premium correctly
            const maternityPlansTotalPremium = maternityPlans.reduce((sum, plan) => sum + parseFloat(plan.calculated_premium || 0), 0).toFixed(2);
  
            // Summing total premium correctly
            const totalPremium = (parseFloat(hrPlansTotalPremium) + parseFloat(maternityPlansTotalPremium)).toFixed(2);
  
            return {
                quotation_details: {
                    id: quotation.quotation_id,
                    status: quotation.status,
                    include_maternity: quotation.include_maternity,
                    created_at: quotation.created_at
                },
                hr_plans: hrPlans.reduce((acc, plan) => {
                    if (!acc[plan.plan_type]) {
                        acc[plan.plan_type] = {
                            age_band_details: [],
                            total_lives: 0,
                            total_premium: 0
                        };
                    }
                    acc[plan.plan_type].age_band_details.push({
                        age_band: plan.age_band,
                        number_of_lives: plan.number_of_lives,
                        premium_rate: plan.premium_rate,
                        calculated_premium: plan.calculated_premium
                    });
                    acc[plan.plan_type].total_lives += plan.number_of_lives;
                    acc[plan.plan_type].total_premium += parseFloat(plan.calculated_premium || 0);
                    return acc;
                }, {}),
                maternity_plans: maternityPlans.reduce((acc, plan) => {
                    if (!acc[plan.plan_type]) {
                        acc[plan.plan_type] = {
                            age_band_details: [],
                            total_spouses: 0,
                            total_premium: 0
                        };
                    }
                    acc[plan.plan_type].age_band_details.push({
                        age_band: plan.age_band,
                        number_of_spouses: plan.number_of_spouses,
                        premium_rate: plan.premium_rate,
                        calculated_premium: plan.calculated_premium
                    });
                    acc[plan.plan_type].total_spouses += plan.number_of_spouses;
                    acc[plan.plan_type].total_premium += parseFloat(plan.calculated_premium || 0);
                    return acc;
                }, {}),
                calculations: {
                    hr_total_lives: quotation.hr_total_lives,
                    hr_total_premium: hrPlansTotalPremium, // Correct format
                    maternity_total_lives: quotation.maternity_total_lives,
                    maternity_total_premium: maternityPlansTotalPremium, // Correct format
                    waiver_percentage: quotation.waiver_percentage,
                    maternity_coverage_status: quotation.maternity_coverage_status,
                    total_premium: totalPremium // Correct total premium format
                }
            };
        }));
  
        return quotationsWithDetails;
    } finally {
        connection.release();
    }
  };
   
module.exports = {
    createQuotation,
    saveHRPlanSelection,
    saveMaternityPlanSelection,
    updateHRLives,
    updateMaternityLives,
    calculateQuotation,
    submitQuotation,
    getQuotationDetails,
    getUserQuotationSummaries
};