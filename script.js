// GLOBALS
let originalTime = "20:00"; // default value
let countdownInterval = null;
const timerEl = document.querySelector('.timer'); // globally accessible

// Convert "MM:SS" to seconds
function timeStringToSeconds(timeStr) {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    return (minutes * 60) + seconds;
}

// Convert seconds back to "MM:SS"
function secondsToTimeString(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Start timer
function startTimer() {
    let remainingSeconds = timeStringToSeconds(timerEl.textContent);

    if (countdownInterval) clearInterval(countdownInterval);

    // Immediately decrement and display 1st tick (so 20:00 becomes 19:59 instantly)
    remainingSeconds--;
    timerEl.textContent = secondsToTimeString(remainingSeconds);

    countdownInterval = setInterval(() => {
        remainingSeconds--;

        if (remainingSeconds < 0) {
            clearInterval(countdownInterval);
            timerEl.textContent = "00:00";
            // TODO: Alarm + Notification
            return;
        }

        timerEl.textContent = secondsToTimeString(remainingSeconds);
    }, 1000);
}


// Reset timer
function resetTime() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    timerEl.textContent = originalTime;
}

// Button event listeners
document.querySelector('.start-button').addEventListener('click', startTimer);
document.querySelector('.reset').addEventListener('click', resetTime);

// Active mode buttons
document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.modes button');

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});

const settingsButton = document.querySelector('.settings');
const settingsModal = document.querySelector('.modal-overlay'); // Get the overlay by class
const closeButton = document.querySelector('.end-section .close'); // Select the 'Close' button in the footer
const navItems = document.querySelectorAll('.modal-nav .nav-item');

// Get all settings content sections (using your existing classes)
const themeSettingsSection = document.getElementById('theme-settings');
const timerSettingsSection = document.querySelector('.timer-settings'); // No ID provided, so using class
const soundSettingsSection = document.querySelector('.sound-settings'); // No ID provided, so using class
// Collect all sections into an array for easy iteration
const allSettingsSections = [themeSettingsSection, timerSettingsSection, soundSettingsSection].filter(Boolean); // filter(Boolean) removes nulls if any section isn't found

const saveChangesButton = document.querySelector('.end-section .savechanges'); // Select savechanges in footer
const resetSettingsButton = document.querySelector('.end-section .reset-settings'); // Select reset-settings in footer
const body = document.body; // Reference to the body element

// Function to open the modal
function openSettingsModal() {
    settingsModal.classList.add('show');
    document.querySelector('#app').classList.add('blurred-background');
}

// Function to close the modal
function closeSettingsModal() {
    settingsModal.classList.remove('show');
    document.querySelector('#app').classList.remove('blurred-background');
}

// Open settings modal
settingsButton.addEventListener('click', openSettingsModal);

// Close settings modal (bottom 'Close' button)
closeButton.addEventListener('click', closeSettingsModal);

// Close modal if clicked outside (on the overlay itself)
settingsModal.addEventListener('click', (event) => {
    // If the click target is exactly the modal-overlay itself, close it
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const volumeSlider = document.getElementById('timerSoundVolume');
  if (!volumeSlider) return;

  volumeSlider.addEventListener('wheel', (e) => {
    e.preventDefault();  // prevent page scroll

    // Normalize delta: positive = scroll down, negative = scroll up
    const direction = e.deltaY > 0 ? -1 : 1;

    // Parse numeric values
    const step  = parseFloat(volumeSlider.step)  || 0.05;
    const min   = parseFloat(volumeSlider.min)   || 0;
    const max   = parseFloat(volumeSlider.max)   || 1;
    let   val   = parseFloat(volumeSlider.value) || 0;

    // Calculate new value and clamp
    val = val + direction * step;
    val = Math.min(Math.max(val, min), max);

    // Apply and dispatch input event
    volumeSlider.value = val.toFixed(2);
    volumeSlider.dispatchEvent(new Event('input'));
  });
});


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
    const select = wrapper.querySelector('select');

    select.addEventListener('mousedown', (e) => {
      // If it’s already “open” then close it and blur immediately
      if (wrapper.classList.contains('active')) {
        wrapper.classList.remove('active');
        select.blur();       // force a blur so CSS/focus-within resets
        e.preventDefault();   // prevent native toggle so you control it
      } else {
        // normal open
        wrapper.classList.add('active');
      }
    });

    // If user picks an option or tabs away, always clear
    select.addEventListener('change', () => {
      wrapper.classList.remove('active');
    });
    select.addEventListener('blur', () => {
      wrapper.classList.remove('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const volumeSlider = document.getElementById('timerSoundVolume');
  if (volumeSlider) {
    // Set initial value to minimum
    volumeSlider.min = 0;
    volumeSlider.max = 1;
    volumeSlider.step = 0.05;
    volumeSlider.value = volumeSlider.min; // places thumb at leftmost position
  }
});

// Navigation for settings sections
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        // Add active class to the clicked nav item
        item.classList.add('active');

        // Get the data-section attribute
        const targetSection = item.dataset.section.toLowerCase(); // Get 'theme', 'timer', or 'sounds'

        // Hide all settings sections
        allSettingsSections.forEach(section => section.classList.remove('active'));

        // Show the target settings section
        if (targetSection === 'theme' && themeSettingsSection) {
            themeSettingsSection.classList.add('active');
        } else if (targetSection === 'timer' && timerSettingsSection) {
            timerSettingsSection.classList.add('active');
        } else if (targetSection === 'sounds' && soundSettingsSection) {
            soundSettingsSection.classList.add('active');
        } else {
            console.warn(`Settings section for '${targetSection}' not found or handled.`);
        }
    });
});

// Initialize the active settings section on load
// This ensures that the 'theme' section is displayed when the modal first opens
// We assume the first nav-item is 'THEME' and it should be active by default.
const initialActiveNavItem = document.querySelector('.modal-nav .nav-item[data-section="THEME"]');
if (initialActiveNavItem) {
    initialActiveNavItem.classList.add('active');
    themeSettingsSection.classList.add('active');
}


// Save Changes button functionality
saveChangesButton.addEventListener('click', () => {
    console.log('Settings saved!');
    alert('Settings saved! (Check console for dummy log)');
    closeSettingsModal(); // Close modal after saving
});

// Reset All button functionality
resetSettingsButton.addEventListener('click', () => { // Corrected variable name
    console.log('All settings reset!');
    alert('All settings have been reset! (Check console for dummy log)');
    // In a real app, you'd reset form fields or localStorage here
    // For now, we'll just close the modal.
    closeSettingsModal();
});

// Finds the button to upload background
const imageButton = document.querySelector('.bg');
const fileInput = document.getElementById('bg-upload');

imageButton.addEventListener('click', () => {
  fileInput.click();  // This will trigger the file picker dialog
});


