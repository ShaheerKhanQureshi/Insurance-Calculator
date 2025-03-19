
const { pool } = require('../config/database');

const getAllQuotationSummaries = async () => {
    try {
      const [users] = await pool.execute(`
          SELECT 
              u.id as user_id,
              u.first_name,
              u.last_name,
              u.mobile_number,
              u.company_name,
              u.work_email,
              u.created_at as user_created_at
          FROM users u
      `);
  
      const usersWithQuotations = await Promise.all(users.map(async (user) => {
        const [quotations] = await pool.execute(`
            SELECT 
                q.id as quotation_id,
                q.created_at as quotation_created_at
            FROM quotations q
            WHERE q.user_id = ?
        `, [user.user_id]);
  
        const quotationsWithDetails = await Promise.all(quotations.map(async (quotation) => {
          const [hrPlans] = await pool.execute(`
              SELECT 
                  plan_type,
                  age_band,
                  number_of_lives
              FROM hr_plans
              WHERE quotation_id = ?
          `, [quotation.quotation_id]);
  
          const [maternityPlans] = await pool.execute(`
              SELECT 
                  plan_type,
                  age_band,
                  number_of_spouses
              FROM maternity_plans
              WHERE quotation_id = ?
          `, [quotation.quotation_id]);
  
          const hrPlansSummary = hrPlans.reduce((acc, plan) => {
            if (!acc[plan.plan_type]) {
              acc[plan.plan_type] = {
                age_band_details: [],
                total_lives: 0
              };
            }
            acc[plan.plan_type].age_band_details.push({
              age_band: plan.age_band,
              number_of_lives: plan.number_of_lives
            });
            acc[plan.plan_type].total_lives += plan.number_of_lives;
            return acc;
          }, {});
  
          const maternityPlansSummary = maternityPlans.reduce((acc, plan) => {
            if (!acc[plan.plan_type]) {
              acc[plan.plan_type] = {
                age_band_details: [],
                total_spouses: 0
              };
            }
            acc[plan.plan_type].age_band_details.push({
              age_band: plan.age_band,
              number_of_spouses: plan.number_of_spouses
            });
            acc[plan.plan_type].total_spouses += plan.number_of_spouses;
            return acc;
          }, {});
  
          const totalHRLives = Object.values(hrPlansSummary).reduce(
            (sum, plan) => sum + plan.total_lives, 0
          );
          const totalMaternitySpouses = Object.values(maternityPlansSummary).reduce(
            (sum, plan) => sum + plan.total_spouses, 0
          );
  
          return {
            quotation_id: quotation.quotation_id,
            created_at: quotation.quotation_created_at,
            hr_plans: hrPlansSummary,
            maternity_plans: maternityPlansSummary,
            summary: {
              total_hr_lives: totalHRLives,
              total_maternity_spouses: totalMaternitySpouses,
              waiver_percentage: calculateWaiverPercentage(totalHRLives)
            }
          };
        }));
  
        return {
          user_details: {
            id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            mobile_number: user.mobile_number,
            company_name: user.company_name,
            work_email: user.work_email,
            created_at: user.user_created_at
          },
          total_quotations: quotations.length,
          quotations: quotationsWithDetails
        };
      }));
  
      return usersWithQuotations;
    } catch (error) {
      console.error('Error in getAllQuotationSummaries:', error);
      throw error;
    }
  };

  // Helper function to calculate waiver percentage
const calculateWaiverPercentage = (totalLives) => {
    if (totalLives <= 5) return 0;
    if (totalLives <= 50) return 15;
    if (totalLives <= 150) return 35;
    if (totalLives <= 350) return 70;
    return 100;
  };
  module.exports = {
    getAllQuotationSummaries
};