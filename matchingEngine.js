// filename: src/services/matchingEngine.js
// DANI DECLARES LLC — RULES-BASED MATCHING ENGINE

import { MASTER_SOLUTIONS_V6 } from '../data/solutionsData';

export function calculateMatch(requestData) {
  const { categoryId, pathwayId, zipCode, urgency } = requestData;

  // Rules-based matching score
  let matchScore = 0;
  let recommendedSolution = null;

  if (categoryId === "prop" && (pathwayId === "property" || pathwayId === "realtor")) {
    matchScore = 95;
    recommendedSolution = MASTER_SOLUTIONS_V6.find(s => s.solutionId === "sol-apartment-community");
  } else if (categoryId === "doc" && pathwayId === "realtor") {
    matchScore = 90;
    recommendedSolution = MASTER_SOLUTIONS_V6.find(s => s.solutionId === "sol-real-estate-agent");
  } else if (categoryId === "biz") {
    matchScore = 88;
    recommendedSolution = MASTER_SOLUTIONS_V6.find(s => s.solutionId === "sol-office-infrastructure");
  } else if (categoryId === "evt") {
    matchScore = 92;
    recommendedSolution = MASTER_SOLUTIONS_V6.find(s => s.solutionId === "sol-event-execution");
  } else {
    matchScore = 85;
    recommendedSolution = MASTER_SOLUTIONS_V6.find(s => s.solutionId === "sol-resident-movein");
  }

  const canFulfillDirect = matchScore >= 80;

  return {
    matchScore: matchScore + "%",
    canFulfillDirect,
    recommendedSolution,
    actionRoute: canFulfillDirect ? "/book" : "/portal/vendors"
  };
}
