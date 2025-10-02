// Carbon Footprint Tracker - Main UI Functions
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init({
    duration: 800,
    once: true,
    offset: 100
  });

  // Initialize the tracker
  initializeTracker();
  
  
  // Set up event listeners
  setupEventListeners();
});

function initializeTracker() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  carbonTracker.setCurrentDate(today);
  
  // Load initial data
  carbonTracker.loadDateData();
}

function setupEventListeners() {
  // Date input change
  const dateInput = document.getElementById('selectedDate');
  if (dateInput) {
    dateInput.addEventListener('change', function() {
      carbonTracker.setCurrentDate(this.value);
    });
  }
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.onclick.toString().match(/switchTab\('(.+?)'\)/)[1];
      switchTab(tabName);
    });
  });
}

// Tab Management
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  const activeButton = document.querySelector(`[onclick*="switchTab('${tabName}')"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  // Update current section display
  updateCurrentSectionDisplay(tabName);
}

function updateCurrentSectionDisplay(section) {
  const sectionTitle = document.getElementById('sectionTitle');
  const sectionIcon = document.getElementById('sectionIcon');
  const sectionEmissions = document.getElementById('currentSectionEmissions');
  
  if (sectionTitle && sectionIcon && sectionEmissions) {
    const dayData = carbonTracker.getCurrentDateData();
    const emissionsKey = section === 'transportation' ? 'transport' : section;
    const emissions = dayData.emissions[emissionsKey] || 0;
    
    const sectionConfig = {
      transportation: {
        name: 'Transportation',
        icon: 'fas fa-car',
        gradient: 'from-blue-500 to-purple-500'
      },
      food: {
        name: 'Food & Diet',
        icon: 'fas fa-utensils',
        gradient: 'from-orange-500 to-red-500'
      },
      energy: {
        name: 'Energy & Utilities',
        icon: 'fas fa-plug',
        gradient: 'from-yellow-500 to-orange-500'
      },
      shopping: {
        name: 'Shopping',
        icon: 'fas fa-shopping-cart',
        gradient: 'from-green-500 to-blue-500'
      },
      waste: {
        name: 'Waste & Recycling',
        icon: 'fas fa-recycle',
        gradient: 'from-purple-500 to-pink-500'
      }
    };
    
    const config = sectionConfig[section];
    if (config) {
      sectionTitle.textContent = config.name;
      sectionIcon.className = `inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-full mb-3`;
      sectionIcon.innerHTML = `<i class="${config.icon} text-white text-2xl"></i>`;
      sectionEmissions.textContent = emissions.toFixed(1);
    }
    
    // Show/hide appropriate section details
    showSectionDetails(section);

    // Populate section-specific details when available
    if (section === 'food') {
      const meatMeals = dayData.food.meatMeals || 0;
      const dairyServings = dayData.food.dairyServings || 0;
      const localProduce = dayData.food.localProduce !== false;

      const meatFactor = carbonTracker.emissionFactors.food.beef;
      const dairyFactor = carbonTracker.emissionFactors.food.dairy;

      const meatEl = document.getElementById('meatEmissions');
      const dairyEl = document.getElementById('dairyEmissions');
      const localEl = document.getElementById('localProduceStatus');

      if (meatEl) meatEl.textContent = (meatMeals * meatFactor).toFixed(1) + ' kg';
      if (dairyEl) dairyEl.textContent = (dairyServings * dairyFactor).toFixed(1) + ' kg';
      if (localEl) localEl.textContent = localProduce ? 'Yes' : 'No';
    } else if (section === 'energy') {
      const electricityKwh = dayData.energy.electricity || 0;
      const gasCubicMeters = dayData.energy.gas || 0;
      const heatingHours = dayData.energy.heating || 0;

      const electricityFactor = carbonTracker.emissionFactors.energy.electricity;
      const gasFactor = carbonTracker.emissionFactors.energy.gas;
      const heatingFactor = carbonTracker.emissionFactors.energy.heating;

      const electricityEl = document.getElementById('electricityEmissions');
      const gasEl = document.getElementById('gasEmissions');
      const heatingEl = document.getElementById('heatingEmissions');

      if (electricityEl) electricityEl.textContent = (electricityKwh * electricityFactor).toFixed(1) + ' kg';
      if (gasEl) gasEl.textContent = (gasCubicMeters * gasFactor).toFixed(1) + ' kg';
      if (heatingEl) heatingEl.textContent = (heatingHours * heatingFactor).toFixed(1) + ' kg';
    } else if (section === 'shopping') {
      // Sum quantities by category from current day data
      const items = Array.isArray(dayData.shopping.items) ? dayData.shopping.items : [];
      const quantities = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (item.quantity || 0);
        return acc;
      }, {});

      const clothingQty = quantities.clothing || 0;
      const electronicsQty = quantities.electronics || 0;
      const otherQty = quantities.general || 0;

      const clothingFactor = carbonTracker.emissionFactors.shopping.clothing;
      const electronicsFactor = carbonTracker.emissionFactors.shopping.electronics;
      const otherFactor = carbonTracker.emissionFactors.shopping.general;

      const clothingEl = document.getElementById('clothingEmissions');
      const electronicsEl = document.getElementById('electronicsEmissions');
      const otherEl = document.getElementById('otherShoppingEmissions');

      if (clothingEl) clothingEl.textContent = (clothingQty * clothingFactor).toFixed(1) + ' kg';
      if (electronicsEl) electronicsEl.textContent = (electronicsQty * electronicsFactor).toFixed(1) + ' kg';
      if (otherEl) otherEl.textContent = (otherQty * otherFactor).toFixed(1) + ' kg';
    } else if (section === 'waste') {
      const generalKg = dayData.waste.general || 0;
      const recyclingKg = dayData.waste.recycling || 0;
      const compostKg = dayData.waste.compost || 0;

      const generalFactor = carbonTracker.emissionFactors.waste.general;
      const recyclingFactor = carbonTracker.emissionFactors.waste.recycling;
      const compostFactor = carbonTracker.emissionFactors.waste.compost;

      const generalEl = document.getElementById('generalWasteEmissions');
      const recyclingEl = document.getElementById('recyclingEmissions');
      const compostEl = document.getElementById('compostEmissions');

      if (generalEl) generalEl.textContent = (generalKg * generalFactor).toFixed(1) + ' kg';
      if (recyclingEl) recyclingEl.textContent = (recyclingKg * recyclingFactor).toFixed(1) + ' kg';
      if (compostEl) compostEl.textContent = (compostKg * compostFactor).toFixed(1) + ' kg';
    } else if (section === 'transportation') {
      // Compute per-source transport emissions
      const commute = dayData.transport.commute;
      let commuteEmission = 0;
      if (commute.mode === 'car') {
        commuteEmission = commute.distance * carbonTracker.emissionFactors.transport.car[commute.fuelType];
      } else if (carbonTracker.emissionFactors.transport[commute.mode]) {
        commuteEmission = commute.distance * carbonTracker.emissionFactors.transport[commute.mode];
      }

      const additionalCarEmission = (dayData.transport.car.enabled ? dayData.transport.car.km : 0)
        * carbonTracker.emissionFactors.transport.car.petrol;

      const publicEmission = (dayData.transport.public.enabled ? dayData.transport.public.km : 0)
        * carbonTracker.emissionFactors.transport.bus;

      const flightFactor = carbonTracker.emissionFactors.transport.flight[dayData.transport.flight.type];
      const flightEmission = (dayData.transport.flight.enabled ? dayData.transport.flight.hours : 0)
        * 500 * flightFactor;

      const commuteEl = document.getElementById('commuteEmissions');
      const carEl = document.getElementById('additionalCarEmissions');
      const publicEl = document.getElementById('publicTransportEmissions');
      const flightEl = document.getElementById('flightEmissions');

      if (commuteEl) commuteEl.textContent = commuteEmission.toFixed(1) + ' kg';
      if (carEl) carEl.textContent = additionalCarEmission.toFixed(1) + ' kg';
      if (publicEl) publicEl.textContent = publicEmission.toFixed(1) + ' kg';
      if (flightEl) flightEl.textContent = flightEmission.toFixed(1) + ' kg';
    }
  }
}

function showSectionDetails(section) {
  // Hide all section details
  const detailSections = ['transportDetails', 'foodDetails', 'energyDetails', 'shoppingDetails', 'wasteDetails'];
  detailSections.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('hidden');
    }
  });
  
  // Map section name to detail container id
  const detailsIdMap = {
    transportation: 'transportDetails',
    food: 'foodDetails',
    energy: 'energyDetails',
    shopping: 'shoppingDetails',
    waste: 'wasteDetails'
  };
  const targetId = detailsIdMap[section] || (section + 'Details');
  
  // Show current section details
  const currentDetails = document.getElementById(targetId);
  if (currentDetails) {
    currentDetails.classList.remove('hidden');
  }
}

// Date Navigation
function changeDate(days) {
  carbonTracker.changeDate(days);
}

function loadDateData() {
  const dateInput = document.getElementById('selectedDate');
  if (dateInput) {
    carbonTracker.setCurrentDate(dateInput.value);
  }
}

// Transportation Functions
function updateCommute(value) {
  document.getElementById('commuteValue').textContent = value;
  
  const dayData = carbonTracker.getCurrentDateData();
  dayData.transport.commute.distance = parseFloat(value);
  
  updateTransportCalculation();
}

function toggleTransportMode(mode) {
  const toggle = document.getElementById(`${mode}Toggle`);
  const inputs = document.getElementById(`${mode}Inputs`);
  
  if (toggle && inputs) {
    const isEnabled = toggle.checked;
    inputs.classList.toggle('hidden', !isEnabled);
    
    const dayData = carbonTracker.getCurrentDateData();
    dayData.transport[mode].enabled = isEnabled;
    
    if (!isEnabled) {
      // Reset values when disabled
      if (mode === 'flight') {
        dayData.transport[mode].hours = 0;
      } else {
        dayData.transport[mode].km = 0;
      }
    }
    
    updateTransportCalculation();
  }
}

function updateTransportCalculation() {
  // Update commute mode and fuel type
  const dayData = carbonTracker.getCurrentDateData();
  
  const commuteMode = document.getElementById('commuteMode');
  const fuelType = document.getElementById('fuelType');
  
  if (commuteMode) dayData.transport.commute.mode = commuteMode.value;
  if (fuelType) dayData.transport.commute.fuelType = fuelType.value;
  
  // Update additional transport data
  ['car', 'public'].forEach(mode => {
    const kmInput = document.getElementById(`${mode}Km`);
    if (kmInput && dayData.transport[mode].enabled) {
      dayData.transport[mode].km = parseFloat(kmInput.value) || 0;
    }
  });
  
  // Update flight data
  const flightType = document.getElementById('flightType');
  const flightHours = document.getElementById('flightHours');
  if (flightType && dayData.transport.flight.enabled) {
    dayData.transport.flight.type = flightType.value;
  }
  if (flightHours && dayData.transport.flight.enabled) {
    dayData.transport.flight.hours = parseFloat(flightHours.value) || 0;
  }
  
  // Recalculate emissions
  carbonTracker.calculateAllEmissions();
}

// File Upload Handlers
function handleTransportFiles(files) {
  if (files.length === 0) return;
  
  const progressDiv = document.getElementById('transportUploadProgress');
  const extractedDiv = document.getElementById('transportExtractedData');
  const progressBar = document.getElementById('transportProgressBar');
  const progressText = document.getElementById('transportProgressText');
  
  // Show progress
  progressDiv.classList.remove('hidden');
  extractedDiv.classList.add('hidden');
  
  // Simulate AI processing
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Show extracted data after processing
      setTimeout(() => {
        progressDiv.classList.add('hidden');
        extractedDiv.classList.remove('hidden');
        
        // Simulate extracted values (in real app, this would come from AI)
        document.getElementById('extractedDistance').value = Math.floor(Math.random() * 50) + 10;
        document.getElementById('extractedTransportType').value = ['Car', 'Bus', 'Train'][Math.floor(Math.random() * 3)];
      }, 500);
    }
    
    progressBar.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
  }, 200);
}

function applyExtractedTransportData() {
  const distance = document.getElementById('extractedDistance').value;
  const transportType = document.getElementById('extractedTransportType').value.toLowerCase();
  
  // Apply to commute if it matches
  if (['car', 'bus', 'train', 'metro'].includes(transportType)) {
    document.getElementById('commuteSlider').value = distance;
    document.getElementById('commuteValue').textContent = distance;
    document.getElementById('commuteMode').value = transportType;
    
    const dayData = carbonTracker.getCurrentDateData();
    dayData.transport.commute.distance = parseFloat(distance);
    dayData.transport.commute.mode = transportType;
  }
  
  updateTransportCalculation();
  
  // Hide extracted data panel
  document.getElementById('transportExtractedData').classList.add('hidden');
  
  alert('Data applied successfully!');
}

// Data Management Functions
function saveCurrentData() {
  carbonTracker.saveData();
  
  // Show success message
  const button = event.target;
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check mr-2"></i>Saved!';
  button.classList.add('bg-green-500');
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.classList.remove('bg-green-500');
  }, 2000);
}

function copyPreviousDay() {
  if (confirm('This will replace current data with yesterday\'s data. Continue?')) {
    carbonTracker.copyPreviousDay();
  }
}

function viewHistory() {
  // In a real app, this would navigate to a history page
  alert('History view would open here. This feature requires backend integration.');
}


// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  } text-white`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Export functions for global access
window.switchTab = switchTab;
window.changeDate = changeDate;
window.loadDateData = loadDateData;
window.updateCommute = updateCommute;
window.toggleTransportMode = toggleTransportMode;
window.updateTransportCalculation = updateTransportCalculation;
window.handleTransportFiles = handleTransportFiles;
window.applyExtractedTransportData = applyExtractedTransportData;
window.saveCurrentData = saveCurrentData;
window.copyPreviousDay = copyPreviousDay;
window.viewHistory = viewHistory;
