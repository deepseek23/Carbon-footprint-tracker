// Carbon Footprint Tracker - Additional Calculation Functions

// Enhanced calculation functions for specific scenarios
function calculateAdvancedTransportEmissions(data) {
  // More sophisticated transport calculations
  let emissions = 0;
  
  // Account for vehicle efficiency, occupancy, etc.
  if (data.transport.commute.mode === 'car') {
    const efficiency = getVehicleEfficiency(data.transport.commute.fuelType);
    const occupancy = data.transport.commute.occupancy || 1;
    emissions += (data.transport.commute.distance * efficiency) / occupancy;
  }
  
  return emissions;
}

function getVehicleEfficiency(fuelType) {
  const efficiencies = {
    petrol: 0.21,
    diesel: 0.24,
    electric: 0.05,
    hybrid: 0.12
  };
  return efficiencies[fuelType] || 0.21;
}

// Food emissions with seasonal adjustments
function calculateSeasonalFoodEmissions(data) {
  let baseEmissions = carbonTracker.calculateFoodEmissions();
  
  // Adjust for seasonal availability
  const currentMonth = new Date().getMonth();
  const winterMonths = [11, 0, 1, 2]; // Dec, Jan, Feb, Mar
  
  if (winterMonths.includes(currentMonth) && !data.food.localProduce) {
    baseEmissions *= 1.4; // Higher emissions for imported food in winter
  }
  
  return baseEmissions;
}

// Smart recommendations based on patterns
function generateSmartRecommendations(weeklyData) {
  const recommendations = [];
  
  // Analyze patterns
  const avgTransport = weeklyData.reduce((sum, day) => sum + (day.transport || 0), 0) / 7;
  const avgFood = weeklyData.reduce((sum, day) => sum + (day.food || 0), 0) / 7;
  
  if (avgTransport > 5) {
    recommendations.push({
      category: 'transport',
      message: 'Consider carpooling or public transport 2 days this week to reduce emissions by 30%',
      impact: avgTransport * 0.3
    });
  }
  
  if (avgFood > 4) {
    recommendations.push({
      category: 'food',
      message: 'Try 2 plant-based meals this week to reduce food emissions by 25%',
      impact: avgFood * 0.25
    });
  }
  
  return recommendations;
}

// Carbon offset calculations
function calculateCarbonOffset(totalEmissions) {
  const offsetOptions = [
    {
      type: 'tree_planting',
      name: 'Tree Planting',
      costPerKg: 0.02, // $0.02 per kg CO2
      description: 'Plant trees to absorb CO2 from atmosphere'
    },
    {
      type: 'renewable_energy',
      name: 'Renewable Energy',
      costPerKg: 0.015,
      description: 'Support renewable energy projects'
    },
    {
      type: 'carbon_capture',
      name: 'Carbon Capture',
      costPerKg: 0.05,
      description: 'Direct air capture technology'
    }
  ];
  
  return offsetOptions.map(option => ({
    ...option,
    cost: (totalEmissions * option.costPerKg).toFixed(2),
    trees: option.type === 'tree_planting' ? Math.ceil(totalEmissions / 22) : null // 1 tree absorbs ~22kg CO2/year
  }));
}

// Benchmark comparisons
function getBenchmarkComparison(userEmissions) {
  const benchmarks = {
    global_average: 4.8, // kg CO2 per day
    developed_country: 8.2,
    sustainable_target: 2.3,
    paris_agreement: 1.5
  };
  
  const comparisons = {};
  Object.keys(benchmarks).forEach(key => {
    const benchmark = benchmarks[key];
    comparisons[key] = {
      value: benchmark,
      percentage: ((userEmissions / benchmark) * 100).toFixed(0),
      status: userEmissions <= benchmark ? 'better' : 'worse'
    };
  });
  
  return comparisons;
}

// Gamification elements
function calculateEcoScore(weeklyData) {
  let score = 100; // Start with perfect score
  
  weeklyData.forEach(day => {
    const dailyTotal = day.emissions || 0;
    const target = 15; // Daily target
    
    if (dailyTotal > target) {
      score -= Math.min(20, (dailyTotal - target) * 2); // Penalty for exceeding target
    } else {
      score += Math.min(5, (target - dailyTotal) * 0.5); // Bonus for staying under
    }
  });
  
  return Math.max(0, Math.min(100, score));
}

function getAchievements(userData) {
  const achievements = [];
  
  // Check for various achievements
  if (userData.consecutiveDaysUnderTarget >= 7) {
    achievements.push({
      name: 'Week Warrior',
      description: 'Stayed under target for 7 consecutive days',
      icon: 'fas fa-trophy',
      color: 'gold'
    });
  }
  
  if (userData.totalTreesEquivalent >= 10) {
    achievements.push({
      name: 'Forest Guardian',
      description: 'Saved emissions equivalent to 10 trees',
      icon: 'fas fa-tree',
      color: 'green'
    });
  }
  
  return achievements;
}

// Export functions for use in other modules
window.calculateAdvancedTransportEmissions = calculateAdvancedTransportEmissions;
window.generateSmartRecommendations = generateSmartRecommendations;
window.calculateCarbonOffset = calculateCarbonOffset;
window.getBenchmarkComparison = getBenchmarkComparison;
window.calculateEcoScore = calculateEcoScore;
window.getAchievements = getAchievements;
