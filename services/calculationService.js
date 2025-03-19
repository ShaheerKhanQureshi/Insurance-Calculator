// services/calculationService.js
const HR_PREMIUM_RATES = {
  "Plan A": {
      "0-17": 33737,
      "18-29": 24428,
      "30-39": 32385,
      "40-49": 44717,
      "50-59": 75509,
      "60-64": 110678,
      "65": 128303
  },
  "Plan B": {
      "0-17": 21575,
      "18-29": 15622,
      "30-39": 20709,
      "40-49": 28597,
      "50-59": 48289,
      "60-64": 70780,
      "65": 82051
  },
  "Plan C": {
      "0-17": 12605,
      "18-29": 9126,
      "30-39": 12100,
      "40-49": 16708,
      "50-59": 28212,
      "60-64": 41351,
      "65": 47937
  },
  "Plan D": {
      "0-17": 8365,
      "18-29": 6057,
      "30-39": 8029,
      "40-49": 11088,
      "50-59": 18723,
      "60-64": 27443,
      "65": 31814
  },
  "Plan E": {
      "0-17": 6638,
      "18-29": 4806,
      "30-39": 6372,
      "40-49": 8798,
      "50-59": 14858,
      "60-64": 21778,
      "65": 25246
  },
  "Plan F": {
      "0-17": 5132,
      "18-29": 3717,
      "30-39": 4928,
      "40-49": 6803,
      "50-59": 11489,
      "60-64": 16840,
      "65": 19520
  }
};

const HR_PLAN_DETAILS = {
  "Plan A": { limit: 1000000, enhancement: "100%", roomAndBoard: 25000 },
  "Plan B": { limit: 700000, enhancement: "100%", roomAndBoard: 20000 },
  "Plan C": { limit: 500000, enhancement: "100%", roomAndBoard: 15000 },
  "Plan D": { limit: 400000, enhancement: "100%", roomAndBoard: 12000 },
  "Plan E": { limit: 300000, enhancement: "100%", roomAndBoard: 10000 },
  "Plan F": { limit: 200000, enhancement: "100%", roomAndBoard: 7000 }
};

const MATERNITY_PLAN_DETAILS = {
  "Plan A": { normal: 150000, complicated: 200000 },
  "Plan B": { normal: 100000, complicated: 150000 },
  "Plan C": { normal: 70000, complicated: 100000 },
  "Plan D": { normal: 50000, complicated: 70000 },
  "Plan E": { normal: 40000, complicated: 60000 }
};

const MATERNITY_PREMIUM_RATES = {
  "Plan A": {
      "upto 25": 73863,
      "26-30": 56135,
      "31-35": 34338,
      "36-40": 15005,
      "41-45": 2114
  },
  "Plan B": {
      "upto 25": 53017,
      "26-30": 40292,
      "31-35": 24646,
      "36-40": 10769,
      "41-45": 1517
  },
  "Plan C": {
      "upto 25": 35955,
      "26-30": 27326,
      "31-35": 16715,
      "36-40": 7305,
      "41-45": 1029
  },
  "Plan D": {
      "upto 25": 25329,
      "26-30": 19249,
      "31-35": 11775,
      "36-40": 5145,
      "41-45": 725
  },
  "Plan E": {
      "upto 25": 21206,
      "26-30": 16117,
      "31-35": 9858,
      "36-40": 4308,
      "41-45": 606
  }
};

const calculateHRPlanDetails = (planLives) => {
  const planDetails = {};
  let totalLives = 0;
  let totalPremium = 0;

  planLives.forEach(plan => {
      const planType = plan.planType;
      
      if (!planDetails[planType]) {
          planDetails[planType] = {
              age_band_details: [],
              plan_limits: HR_PLAN_DETAILS[planType],
              totals: {
                  total_lives: 0,
                  total_premium: 0
              }
          };
      }

      plan.ageBands.forEach(ageBand => {
          const { ageRange, numberOfLives } = ageBand;
          const premiumRate = HR_PREMIUM_RATES[planType][ageRange];
          const calculatedPremium = numberOfLives * premiumRate;

          planDetails[planType].age_band_details.push({
              age_band: ageRange,
              number_of_lives: numberOfLives,
              premium_rate: premiumRate,
              calculated_premium: calculatedPremium
          });

          planDetails[planType].totals.total_lives += numberOfLives;
          planDetails[planType].totals.total_premium += calculatedPremium;
          totalLives += numberOfLives;
          totalPremium += calculatedPremium;
      });
  });

  const waiverPercentage = totalLives <= 5 ? 0 :
      totalLives <= 50 ? 15 :
      totalLives <= 150 ? 35 :
      totalLives <= 350 ? 70 : 100;

  return {
      plan_details: planDetails,
      overall_totals: {
          total_lives: totalLives,
          total_premium: totalPremium
      },
      waiver_percentage: waiverPercentage
  };
};

const calculateMaternityPlanDetails = (planLives) => {
  const planDetails = {};
  let totalSpouses = 0;
  let totalPremium = 0;

  planLives.forEach(plan => {
      const planType = plan.planType;
      
      if (!planDetails[planType]) {
          planDetails[planType] = {
              age_band_details: [],
              plan_limits: MATERNITY_PLAN_DETAILS[planType],
              totals: {
                  total_spouses: 0,
                  total_premium: 0
              }
          };
      }

      plan.ageBands.forEach(ageBand => {
          const { ageRange, numberOfSpouses } = ageBand;
          const premiumRate = MATERNITY_PREMIUM_RATES[planType][ageRange];
          const calculatedPremium = numberOfSpouses * premiumRate;

          planDetails[planType].age_band_details.push({
              age_band: ageRange,
              number_of_spouses: numberOfSpouses,
              premium_rate: premiumRate,
              calculated_premium: calculatedPremium
          });

          planDetails[planType].totals.total_spouses += numberOfSpouses;
          planDetails[planType].totals.total_premium += calculatedPremium;
          totalSpouses += numberOfSpouses;
          totalPremium += calculatedPremium;
      });
  });

  const coverageDetails = {
      waiting_period: totalSpouses >= 10 ? 0 : 6,
      preexisting_coverage: totalSpouses >= 10,
      coverage_status: totalSpouses < 5 ? "Not eligible for maternity coverage" :
          totalSpouses >= 10 ? "Eligible with immediate coverage" :
          "Eligible with 6-month waiting period"
  };

  return {
      plan_details: planDetails,
      overall_totals: {
          total_spouses: totalSpouses,
          total_premium: totalPremium
      },
      coverage_details: coverageDetails
  };
};

module.exports = {
  calculateHRPlanDetails,
  calculateMaternityPlanDetails,
  HR_PLAN_DETAILS,
  MATERNITY_PLAN_DETAILS,
  HR_PREMIUM_RATES,
  MATERNITY_PREMIUM_RATES
};