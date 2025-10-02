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
  
  // Initialize charts
  initializeCharts();
  
  // Set up event listeners
  setupEventListeners();
});

function initializeTracker() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  carbonTracker.setCurrentDate(today);
  
  // Update summary stats
  updateSummaryStats();
  
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
  const sectionText = document.getElementById('currentSectionText');
  const sectionEmissions = document.getElementById('currentSectionEmissions');
  
  if (sectionText && sectionEmissions) {
    const dayData = carbonTracker.getCurrentDateData();
    const emissions = dayData.emissions[section] || 0;
    
    const sectionNames = {
      transportation: 'Transportation',
      food: 'Food & Diet',
      energy: 'Energy & Utilities',
      shopping: 'Shopping',
      waste: 'Waste & Recycling',
      other: 'Other Activities'
    };
    
    sectionText.innerHTML = `${sectionNames[section]}: <span id="currentSectionEmissions" class="text-blue-600">${emissions.toFixed(1)}</span> kg CO₂`;
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
  
  // Update summary stats
  updateSummaryStats();
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

// Summary Statistics
function updateSummaryStats() {
  const weeklyData = carbonTracker.getWeeklyData();
  const monthlyTotal = carbonTracker.getMonthlyTotal();
  
  // Calculate weekly average
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.emissions, 0);
  const weeklyAvg = weeklyTotal / 7;
  
  // Update displays
  carbonTracker.updateElement('weeklyAvg', weeklyAvg.toFixed(1));
  carbonTracker.updateElement('monthlyTotal', monthlyTotal.toFixed(1));
  
  // Calculate target progress (monthly)
  const monthlyTarget = carbonTracker.dailyTargets.total * 30; // Assume 30 days
  const targetProgress = Math.min((monthlyTotal / monthlyTarget) * 100, 100);
  carbonTracker.updateElement('targetProgress', targetProgress.toFixed(0) + '%');
  
  // Update weekly trend chart
  updateWeeklyChart(weeklyData);
}

// Chart Management
let weeklyChart = null;

function initializeCharts() {
  const ctx = document.getElementById('weeklyTrendChart');
  if (!ctx) return;
  
  weeklyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Daily Emissions (kg CO₂)',
        data: [],
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          beginAtZero: true,
          max: 20,
          ticks: {
            font: {
              size: 10
            }
          }
        }
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    }
  });
}

function updateWeeklyChart(weeklyData) {
  if (!weeklyChart) return;
  
  const labels = weeklyData.map(day => {
    const date = new Date(day.date);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const data = weeklyData.map(day => day.emissions);
  
  weeklyChart.data.labels = labels;
  weeklyChart.data.datasets[0].data = data;
  weeklyChart.update();
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
