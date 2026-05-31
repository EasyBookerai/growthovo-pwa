let currentStep = 1;
let selectedMood = null;
let moodEmoji = null;
let moodLabel = null;
let focusText = '';

function selectMood(mood, emoji, label) {
  selectedMood = mood;
  moodEmoji = emoji;
  moodLabel = label;

  // Update UI
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');

  // Enable next button
  document.getElementById('next1Btn').disabled = false;
}

function checkFocus() {
  const textarea = document.getElementById('focusInput');
  focusText = textarea.value.trim();
  document.getElementById('next2Btn').disabled = focusText.length === 0;
}

function nextStep() {
  if (currentStep < 3) {
    currentStep++;
    updateUI();
  } else {
    finishCheckin();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

function updateUI() {
  // Hide all steps
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`step${i}`).style.display = 'none';
  }

  // Show current step
  document.getElementById(`step${currentStep}`).style.display = 'block';

  // Update step indicator
  document.getElementById('stepNum').textContent = currentStep;

  // If step 3, build summary
  if (currentStep === 3) {
    buildSummary();
    
    // Update XP in localStorage
    let xp = parseInt(localStorage.getItem('growthovo_xp') || '0');
    xp += 50;
    localStorage.setItem('growthovo_xp', xp.toString());
    
    // Mark today's check-in as completed
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('growthovo_last_checkin', today);
  }
}

function buildSummary() {
  const summaryDiv = document.getElementById('summaryDiv');
  summaryDiv.innerHTML = `
    <div class="summary-row">
      <div class="summary-label">Mood:</div>
      <div class="summary-value">${moodEmoji} ${moodLabel}</div>
    </div>
    <div class="summary-row">
      <div class="summary-label">Focus:</div>
      <div class="summary-value">${focusText}</div>
    </div>
  `;
}

function finishCheckin() {
  window.location.href = 'home.html';
}

function goHome() {
  window.location.href = 'home.html';
}
