// Carbon Footprint Tracker - Data Management
class CarbonTracker {
  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0];
    this.data = this.loadData();
    this.emissionFactors = {
      transport: {
        car: { petrol: 0.21, diesel: 0.24, electric: 0.05, hybrid: 0.12 },
        bus: 0.08,
        train: 0.06,
        metro: 0.04,
        bike: 0,
        walk: 0,
        flight: { domestic: 0.25, international: 0.18 }
      },
      food: {
        beef: 6.8,
        chicken: 2.1,
        pork: 3.2,
        fish: 1.8,
        dairy: 0.9,
        vegetables: 0.2,
        grains: 0.4
      },
      energy: {
        electricity: 0.5, // kg CO2 per kWh
        gas: 2.0, // kg CO2 per cubic meter
        heating: 0.3
      },
      shopping: {
        clothing: 8.0, // kg CO2 per item
        electronics: 50.0,
        books: 1.0,
        general: 2.0
      },
      waste: {
        general: 0.5, // kg CO2 per kg waste
        recycling: -0.1, // negative because it saves emissions
        compost: -0.2
      }
    };
    this.dailyTargets = {
      transport: 5.0,
      food: 4.0,
      energy: 3.0,
      shopping: 1.5,
      waste: 0.5,
      other: 1.0,
      total: 15.0
    };
  }

  // Data Management
  loadData() {
    const stored = localStorage.getItem('carbonTrackerData');
    return stored ? JSON.parse(stored) : {};
  }

  saveData() {
    localStorage.setItem('carbonTrackerData', JSON.stringify(this.data));
  }

  getCurrentDateData() {
    if (!this.data[this.currentDate]) {
      this.data[this.currentDate] = this.getEmptyDayData();
    }
    return this.data[this.currentDate];
  }

  getEmptyDayData() {
    return {
      timestamp: new Date().toISOString(),
      transport: {
        commute: { distance: 0, mode: 'car', fuelType: 'petrol' },
        car: { enabled: false, km: 0 },
        public: { enabled: false, km: 0 },
        flight: { enabled: false, type: 'domestic', hours: 0 }
      },
      food: {
        meals: { breakfast: '', lunch: '', dinner: '' },
        meatMeals: 0,
        dairyServings: 0,
        localProduce: true
      },
      energy: {
        electricity: 0,
        gas: 0,
        heating: 0
      },
      shopping: {
        items: [],
        totalSpent: 0
      },
      waste: {
        general: 0,
        recycling: 0,
        compost: 0
      },
      other: {
        activities: []
      },
      emissions: {
        transport: 0,
        food: 0,
        energy: 0,
        shopping: 0,
        waste: 0,
        other: 0,
        total: 0
      }
    };
  }

  // Date Management
  setCurrentDate(date) {
    this.currentDate = date;
    this.updateDateDisplay();
    this.loadDateData();
  }

  changeDate(days) {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() + days);
    this.setCurrentDate(date.toISOString().split('T')[0]);
  }

  updateDateDisplay() {
    const dateInput = document.getElementById('selectedDate');
    const dateLabel = document.getElementById('dateLabel');
    
    if (dateInput) dateInput.value = this.currentDate;
    
    if (dateLabel) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (this.currentDate === today) {
        dateLabel.textContent = 'Today';
      } else if (this.currentDate === yesterdayStr) {
        dateLabel.textContent = 'Yesterday';
      } else {
        const date = new Date(this.currentDate);
        dateLabel.textContent = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
  }

  loadDateData() {
    const dayData = this.getCurrentDateData();
    this.populateFormFields(dayData);
    this.calculateAllEmissions();
  }

  populateFormFields(dayData) {
    // Transport
    if (document.getElementById('commuteSlider')) {
      document.getElementById('commuteSlider').value = dayData.transport.commute.distance;
      document.getElementById('commuteValue').textContent = dayData.transport.commute.distance;
      document.getElementById('commuteMode').value = dayData.transport.commute.mode;
      document.getElementById('fuelType').value = dayData.transport.commute.fuelType;
    }

    // Additional transport modes
    ['car', 'public', 'flight'].forEach(mode => {
      const toggle = document.getElementById(`${mode}Toggle`);
      const inputs = document.getElementById(`${mode}Inputs`);
      if (toggle && inputs) {
        toggle.checked = dayData.transport[mode].enabled;
        inputs.classList.toggle('hidden', !dayData.transport[mode].enabled);
        
        if (mode === 'flight') {
          const typeSelect = document.getElementById('flightType');
          const hoursInput = document.getElementById('flightHours');
          if (typeSelect) typeSelect.value = dayData.transport[mode].type;
          if (hoursInput) hoursInput.value = dayData.transport[mode].hours;
        } else {
          const kmInput = document.getElementById(`${mode}Km`);
          if (kmInput) kmInput.value = dayData.transport[mode].km;
        }
      }
    });
  }

  // Emission Calculations
  calculateTransportEmissions() {
    const dayData = this.getCurrentDateData();
    let total = 0;

    // Commute emissions
    const commute = dayData.transport.commute;
    if (commute.mode === 'car') {
      total += commute.distance * this.emissionFactors.transport.car[commute.fuelType];
    } else if (this.emissionFactors.transport[commute.mode]) {
      total += commute.distance * this.emissionFactors.transport[commute.mode];
    }

    // Additional car travel
    if (dayData.transport.car.enabled) {
      total += dayData.transport.car.km * this.emissionFactors.transport.car.petrol;
    }

    // Public transport
    if (dayData.transport.public.enabled) {
      total += dayData.transport.public.km * this.emissionFactors.transport.bus;
    }

    // Flights
    if (dayData.transport.flight.enabled) {
      const flightFactor = this.emissionFactors.transport.flight[dayData.transport.flight.type];
      total += dayData.transport.flight.hours * 500 * flightFactor; // Assume 500km/hour
    }

    dayData.emissions.transport = total;
    return total;
  }

  calculateFoodEmissions() {
    const dayData = this.getCurrentDateData();
    let total = 0;

    // Simple calculation based on meat meals and dairy
    total += dayData.food.meatMeals * this.emissionFactors.food.beef;
    total += dayData.food.dairyServings * this.emissionFactors.food.dairy;

    // Adjust for local produce
    if (!dayData.food.localProduce) {
      total *= 1.2; // 20% increase for non-local
    }

    dayData.emissions.food = total;
    return total;
  }

  calculateEnergyEmissions() {
    const dayData = this.getCurrentDateData();
    let total = 0;

    total += dayData.energy.electricity * this.emissionFactors.energy.electricity;
    total += dayData.energy.gas * this.emissionFactors.energy.gas;
    total += dayData.energy.heating * this.emissionFactors.energy.heating;

    dayData.emissions.energy = total;
    return total;
  }

  calculateShoppingEmissions() {
    const dayData = this.getCurrentDateData();
    let total = 0;

    dayData.shopping.items.forEach(item => {
      const factor = this.emissionFactors.shopping[item.category] || this.emissionFactors.shopping.general;
      total += item.quantity * factor;
    });

    dayData.emissions.shopping = total;
    return total;
  }

  calculateWasteEmissions() {
    const dayData = this.getCurrentDateData();
    let total = 0;

    total += dayData.waste.general * this.emissionFactors.waste.general;
    total += dayData.waste.recycling * this.emissionFactors.waste.recycling;
    total += dayData.waste.compost * this.emissionFactors.waste.compost;

    dayData.emissions.waste = Math.max(0, total); // Don't go negative
    return dayData.emissions.waste;
  }

  calculateOtherEmissions() {
    const dayData = this.getCurrentDateData();
    let total = 0;

    dayData.other.activities.forEach(activity => {
      total += activity.emissions || 0;
    });

    dayData.emissions.other = total;
    return total;
  }

  calculateAllEmissions() {
    const emissions = {
      transport: this.calculateTransportEmissions(),
      food: this.calculateFoodEmissions(),
      energy: this.calculateEnergyEmissions(),
      shopping: this.calculateShoppingEmissions(),
      waste: this.calculateWasteEmissions(),
      other: this.calculateOtherEmissions()
    };

    emissions.total = Object.values(emissions).reduce((sum, val) => sum + val, 0);
    
    const dayData = this.getCurrentDateData();
    dayData.emissions = emissions;
    
    this.updateDisplay(emissions);
    this.saveData();
    
    return emissions;
  }

  updateDisplay(emissions) {
    // Update main display
    this.updateElement('totalEmissions', emissions.total.toFixed(1));
    this.updateElement('dailyTotal', emissions.total.toFixed(1));
    
    // Update breakdown
    Object.keys(emissions).forEach(category => {
      if (category !== 'total') {
        this.updateElement(`${category}Emissions`, emissions[category].toFixed(1) + ' kg');
      }
    });

    // Update gauge
    this.updateGauge(emissions.total);
    
    // Update progress bar
    this.updateProgressBar(emissions.total);
    
    // Update smart tip
    this.updateSmartTip(emissions);
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  updateGauge(value) {
    const maxValue = this.dailyTargets.total * 1.5; // 150% of target
    const percentage = Math.min(value / maxValue, 1);
    const circumference = 502.4; // 2 * π * 80
    const offset = circumference - (percentage * circumference);
    
    const gauge = document.getElementById('mainGaugeProgress');
    if (gauge) {
      gauge.style.strokeDashoffset = offset;
    }
  }

  updateProgressBar(value) {
    const percentage = Math.min((value / this.dailyTargets.total) * 100, 100);
    const progressBar = document.getElementById('targetProgressBar');
    const percentageText = document.getElementById('targetPercentage');
    const statusText = document.getElementById('targetStatus');
    
    if (progressBar) progressBar.style.width = percentage + '%';
    if (percentageText) percentageText.textContent = percentage.toFixed(0) + '%';
    
    if (statusText) {
      if (percentage <= 100) {
        statusText.textContent = 'Within target';
        statusText.className = 'text-sm font-medium status-good';
      } else if (percentage <= 120) {
        statusText.textContent = 'Slightly over';
        statusText.className = 'text-sm font-medium status-warning';
      } else {
        statusText.textContent = 'Over target';
        statusText.className = 'text-sm font-medium status-danger';
      }
    }
  }

  updateSmartTip(emissions) {
    const tipElement = document.getElementById('smartTip');
    if (!tipElement) return;

    const highest = Object.entries(emissions)
      .filter(([key]) => key !== 'total')
      .sort(([,a], [,b]) => b - a)[0];

    if (!highest || highest[1] === 0) {
      tipElement.textContent = 'Start tracking your activities to get personalized insights!';
      return;
    }

    const [category, value] = highest;
    const target = this.dailyTargets[category];
    
    if (value > target) {
      const tips = {
        transport: 'Consider using public transport or cycling to reduce transport emissions.',
        food: 'Try incorporating more plant-based meals to lower your food footprint.',
        energy: 'Turn off unused appliances and consider energy-efficient alternatives.',
        shopping: 'Buy only what you need and choose sustainable products.',
        waste: 'Increase recycling and composting to reduce waste emissions.',
        other: 'Look for ways to make your other activities more sustainable.'
      };
      tipElement.textContent = tips[category] || 'Focus on reducing your highest emission category.';
    } else {
      tipElement.textContent = 'Great job! You\'re within your daily targets. Keep it up!';
    }
  }

  // History and Analytics
  getWeeklyData() {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = this.data[dateStr];
      weekData.push({
        date: dateStr,
        emissions: dayData ? dayData.emissions.total : 0
      });
    }
    return weekData;
  }

  getMonthlyTotal() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    let total = 0;
    
    for (let d = new Date(firstDay); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = this.data[dateStr];
      if (dayData) {
        total += dayData.emissions.total;
      }
    }
    
    return total;
  }

  copyPreviousDay() {
    const yesterday = new Date(this.currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayData = this.data[yesterdayStr];
    if (yesterdayData) {
      const newData = JSON.parse(JSON.stringify(yesterdayData));
      newData.timestamp = new Date().toISOString();
      this.data[this.currentDate] = newData;
      this.loadDateData();
      alert('Previous day\'s data copied successfully!');
    } else {
      alert('No data found for previous day.');
    }
  }
}

// Initialize the tracker
const carbonTracker = new CarbonTracker();
