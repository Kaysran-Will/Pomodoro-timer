// GLOBALS
let originalTime = "20:00"; // default value
let countdownInterval = null;
const timerEl = document.querySelector('.timer'); // globally accessible
let currentMode = 'POMODORO';
let durations = {
  POMODORO: 20 * 60,
  'SHORT BREAK': 5 * 60,
  'LONG BREAK': 15 * 60
};
let appliedTheme = localStorage.getItem('appliedTheme') || "Cozy";
let appliedAlarmKey = localStorage.getItem('appliedAlarmKey') || "Digital";
let appliedVolume = localStorage.getItem('appliedVolume') || "0.5";
let appliedNotifications = localStorage.getItem('appliedNotifications') !== "false";

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

// Play alarm sound
let activeAlarm = null;

function stopActiveAlarm() {
  if (activeAlarm) {
    activeAlarm.pause();
    activeAlarm.currentTime = 0;
    activeAlarm = null;
  }
}

function playAlarmSound() {
  const playSoundEnabled = document.getElementById('playTimerSound').checked;
  if (!playSoundEnabled) return;
  const src = alarmAudioSources[appliedAlarmKey] || alarmAudioSources["Digital"];
  const audio = new Audio(src);
  audio.loop = true; // Alarm should loop
  setCurrentAudio(audio);
  activeAlarm = audio;
  audio.play();

  // Stop on click anywhere
  const stopFn = () => {
    stopActiveAlarm();
    document.removeEventListener('click', stopFn);
  };
  setTimeout(() => {
    document.addEventListener('click', stopFn);
  }, 100);
}

function showNotification() {
  const playNotification = document.getElementById('playTimerSound').checked;
  if (!playNotification) return;

  if (Notification.permission === 'granted') {
    const notif = new Notification('Timer Complete!', { body: `${currentMode} session has ended.` });
    notif.onclose = () => { stopActiveAlarm(); };
    notif.onclick = () => { stopActiveAlarm(); window.focus(); };
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        const notif = new Notification('Timer Complete!', { body: `${currentMode} session has ended.` });
        notif.onclose = () => { stopActiveAlarm(); };
        notif.onclick = () => { stopActiveAlarm(); window.focus(); };
      }
    });
  }
}

// Start timer
function startTimer() {
  let remainingSeconds = timeStringToSeconds(timerEl.textContent);
  if (remainingSeconds <= 0) return;

  const btn = document.querySelector('.start-button');

  if (countdownInterval) {
    // Treat as PAUSE
    clearInterval(countdownInterval);
    countdownInterval = null;
    btn.textContent = "RESUME";
    return;
  }

  btn.textContent = "PAUSE";
  // Immediately decrement and display 1st tick (so 20:00 becomes 19:59 instantly)
  remainingSeconds--;
  timerEl.textContent = secondsToTimeString(remainingSeconds);

  countdownInterval = setInterval(() => {
    remainingSeconds--;

    if (remainingSeconds < 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      timerEl.textContent = "00:00";
      btn.textContent = "START!";
      playAlarmSound();
      showNotification();
      return;
    }

    timerEl.textContent = secondsToTimeString(remainingSeconds);
  }, 1000);
}


// Reset timer
function resetTime() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
  timerEl.textContent = originalTime;
  document.querySelector('.start-button').textContent = "START!";
}

// Button event listeners
document.querySelector('.start-button').addEventListener('click', startTimer);
document.querySelector('.reset').addEventListener('click', resetTime);

// Active mode buttons
document.addEventListener('DOMContentLoaded', () => {
  const modeButtons = document.querySelectorAll('.modes button');

  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedMode = button.textContent.trim();

      modeButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentMode = selectedMode;
      
      originalTime = secondsToTimeString(durations[currentMode]);
      
      const btn = document.querySelector('.start-button');
      // ONLY update the display time if the timer is not currently running or paused mid-way!
      if (!countdownInterval && btn.textContent !== "RESUME") {
        timerEl.textContent = originalTime;
      }
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
  document.getElementById('pom').value = durations['POMODORO'] / 60;
  document.getElementById('sbr').value = durations['SHORT BREAK'] / 60;
  document.getElementById('lbr').value = durations['LONG BREAK'] / 60;
  
  document.getElementById('theme-select').value = appliedTheme;
  document.getElementById('alertSound').value = appliedAlarmKey;
  document.getElementById('timerSoundVolume').value = appliedVolume;
  document.getElementById('playTimerSound').checked = appliedNotifications;

  if (typeof updateDeleteThemeBtn === 'function') updateDeleteThemeBtn();

  settingsModal.classList.add('show');
  document.querySelector('#app').classList.add('blurred-background');
}

// Function to close the modal
function closeSettingsModal() {
  // Revert preview changes
  selectedAlarmKey = appliedAlarmKey;
  document.getElementById('timerSoundVolume').value = appliedVolume;
  
  const bgUrl = typeof backgrounds !== 'undefined' ? backgrounds[appliedTheme] : "https://i.pinimg.com/1200x/90/70/32/9070324cdfc07c68d60eed0c39e77573.jpg";
  if (bgUrl) document.querySelector('.background-layer').style.backgroundImage = `url("${bgUrl}")`;

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
    const step = parseFloat(volumeSlider.step) || 0.05;
    const min = parseFloat(volumeSlider.min) || 0;
    const max = parseFloat(volumeSlider.max) || 1;
    let val = parseFloat(volumeSlider.value) || 0;

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
      // If it's already "open" then close it and blur immediately
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
    volumeSlider.value = appliedVolume;
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
  const pom = parseInt(document.getElementById('pom').value) || 20;
  const sbr = parseInt(document.getElementById('sbr').value) || 5;
  const lbr = parseInt(document.getElementById('lbr').value) || 15;

  durations['POMODORO'] = pom * 60;
  durations['SHORT BREAK'] = sbr * 60;
  durations['LONG BREAK'] = lbr * 60;

  const newTheme = document.getElementById('theme-select').value;
  appliedAlarmKey = document.getElementById('alertSound').value;
  appliedVolume = document.getElementById('timerSoundVolume').value;
  appliedNotifications = document.getElementById('playTimerSound').checked;

  selectedAlarmKey = appliedAlarmKey;

  localStorage.setItem('appliedTheme', newTheme);
  localStorage.setItem('appliedAlarmKey', appliedAlarmKey);
  localStorage.setItem('appliedVolume', appliedVolume);
  localStorage.setItem('appliedNotifications', appliedNotifications);

  originalTime = secondsToTimeString(durations[currentMode]);
  
  const btn = document.querySelector('.start-button');
  if (!countdownInterval && btn.textContent !== "RESUME") {
    timerEl.textContent = originalTime;
    btn.textContent = "START!";
  }

  appliedTheme = newTheme;
  document.querySelector('.background-layer').style.backgroundImage = `url("${backgrounds[appliedTheme]}")`;

  // Close modal after saving
  settingsModal.classList.remove('show');
  document.querySelector('#app').classList.remove('blurred-background');
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

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      
      const prompted = prompt("Enter a name for this custom background:");
      if (prompted === null) return; // Cancel upload entirely
      const themeName = prompted.trim() || `Custom ${Math.floor(Math.random() * 1000)}`;
      
      let customUploads = JSON.parse(localStorage.getItem('customUploads') || '[]');
      customUploads.push({name: themeName, url: url});
      
      try {
        localStorage.setItem('customUploads', JSON.stringify(customUploads));
      } catch (err) {
        alert("Local storage is full! Could not save background permanently.");
        // We will still apply it temporarily
      }
      
      backgrounds[themeName] = url;
      
      const select = document.getElementById('theme-select');
      if (select) {
        const option = document.createElement('option');
        option.value = themeName;
        option.textContent = themeName;
        select.appendChild(option);
      }
      
      appliedTheme = themeName;
      localStorage.setItem('appliedTheme', appliedTheme);
      document.querySelector('.background-layer').style.backgroundImage = `url("${url}")`;
      if (typeof updateDeleteThemeBtn === 'function') updateDeleteThemeBtn();
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector('.playlist').addEventListener('click', () => {
  showMusicPlayer();
});

//Changing background according to dropdown list
const element = document.querySelector('.background-layer');
const backgrounds = {
  Cozy: "https://images4.alphacoders.com/140/thumb-1920-1405993.png",
  Sunrise: "https://images7.alphacoders.com/120/thumb-1920-1205979.png",
  Night: "https://i.pinimg.com/1200x/0b/a9/e2/0ba9e25e74077f7e01b2de8451ee952a.jpg"
};

function updateDeleteThemeBtn() {
  const select = document.getElementById('theme-select');
  const btn = document.getElementById('deleteThemeBtn');
  if (!select || !btn) return;
  const isCustom = !['Cozy', 'Sunrise', 'Night'].includes(select.value);
  btn.style.display = isCustom ? 'inline-block' : 'none';
}

function applyThemeColors(themeName) {
  const themeColors = {
    Cozy: "#2c3e50",
    Sunrise: "#2c3e50",
    Night: "#ffffff"
  };
  const selectedColor = themeColors[themeName] || "#ffffff";
  document.body.style.color = selectedColor;
  
  document.querySelectorAll('.modes button, .controls button, .controls .settings, .controls .reset').forEach(btn => {
    btn.style.borderColor = (themeName === 'Cozy' || themeName === 'Sunrise') ? 'rgba(44, 62, 80, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    btn.style.color = selectedColor;
  });
}

function backg() {
  const key = this.value; // Cozy / Sunrise / Night / Custom XYZ
  const url = backgrounds[key];
  element.style.backgroundImage = `url("${url}")`;
  updateDeleteThemeBtn();
  applyThemeColors(key);
}

document.getElementById('theme-select').addEventListener("change", backg);

if (document.getElementById('deleteThemeBtn')) {
  document.getElementById('deleteThemeBtn').addEventListener('click', () => {
    const select = document.getElementById('theme-select');
    const themeName = select.value;
    
    if (!['Cozy', 'Sunrise', 'Night'].includes(themeName)) {
      if (confirm(`Delete the custom background "${themeName}"?`)) {
        let customUploads = JSON.parse(localStorage.getItem('customUploads') || '[]');
        customUploads = customUploads.filter(c => c.name !== themeName);
        localStorage.setItem('customUploads', JSON.stringify(customUploads));
        
        delete backgrounds[themeName];
        
        const option = select.querySelector(`option[value="${themeName}"]`);
        if (option) option.remove();
        
        if (appliedTheme === themeName) {
          appliedTheme = "Cozy";
          localStorage.setItem('appliedTheme', appliedTheme);
          document.querySelector('.background-layer').style.backgroundImage = `url("${backgrounds['Cozy']}")`;
        }
        
        select.value = "Cozy";
        backg.call(select);
      }
    }
  });
}

// Load background on startup
window.addEventListener('load', () => {
  let customUploads = JSON.parse(localStorage.getItem('customUploads') || '[]');
  const select = document.getElementById('theme-select');
  
  customUploads.forEach(c => {
    backgrounds[c.name] = c.url;
    if (select) {
      const option = document.createElement('option');
      option.value = c.name;
      option.textContent = c.name;
      select.appendChild(option);
    }
  });

  document.querySelector('.background-layer').style.backgroundImage = `url("${backgrounds[appliedTheme] || backgrounds['Cozy']}")`;
  applyThemeColors(appliedTheme || 'Cozy');
  
  // Request notification permission if not asked yet
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

//List of audio files in usage
const alarmAudioSources = {
  Digital: 'assets/Digital alarm clock sound.mp3',
  Classic: 'assets/Classic Alarm Clock - Sound Effect  ProSounds.mp3',
  Siren: 'assets/Alarm sound effect.mp3',
  Watchtower: 'assets/Ominous Bells of Doom.mp3'
};
// Sound Preview
function playAudioForDuration(durationInSeconds) {
  const src = alarmAudioSources[selectedAlarmKey];
  if (!src) return;
  const audio = new Audio(src);
  setCurrentAudio(audio);
  audio.play();

  // Set a timer to pause the audio after the specified duration
  setTimeout(() => {
    audio.pause();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      console.log(`Audio stopped after ${durationInSeconds} seconds.`);
    }
  }, durationInSeconds * 1000);
}

let selectedAlarmKey = appliedAlarmKey; // default
function run() {
  selectedAlarmKey = this.value; // persist choice
  playAudioForDuration(10); // preview
}
document.getElementById('alertSound').addEventListener("change", run);


//Volume slider functionality

let currentlyPlayingAudio = null;
function setCurrentAudio(newAudio) {
  if (currentlyPlayingAudio) {
    currentlyPlayingAudio.pause();
    currentlyPlayingAudio.currentTime = 0;
  }
  currentlyPlayingAudio = newAudio;
  const volumeSlider = document.getElementById('timerSoundVolume');
  if (volumeSlider) {
    const value = parseFloat(volumeSlider.value) || 0.5;
    newAudio.volume = Math.pow(value, 2);
  }
}

// Music Player Overlay Functionality
const musicOverlay = document.getElementById('musicOverlay');
const closeMusicPlayer = document.getElementById('closeMusicPlayer');
const songDropdown = document.getElementById('songDropdown');
const selectedSong = document.getElementById('selectedSong');
const songOptions = document.getElementById('songOptions');

// Show overlay function (call this from your playlist button)
function showMusicPlayer() {
  musicOverlay.removeAttribute('hidden');
  setTimeout(() => musicOverlay.classList.add('show'), 10);
}

// Hide overlay function
function hideMusicPlayer() {
  musicOverlay.classList.remove('show');
  setTimeout(() => musicOverlay.setAttribute('hidden', ''), 300);
}

// Close button functionality
closeMusicPlayer.addEventListener('click', hideMusicPlayer);

// Close when clicking outside
musicOverlay.addEventListener('click', (e) => {
  if (e.target === musicOverlay) {
    hideMusicPlayer();
  }
});

// Dropdown functionality
selectedSong.addEventListener('click', (e) => {
  e.stopPropagation();
  songDropdown.classList.toggle('open');
});

// Song selection
let musicAudioCtx = null;
let musicGainNode = null;
let musicSourceNode = null;

songOptions.addEventListener('click', (e) => {
  const option = e.target.closest('.song-option');
  if (option) {
    // Remove active class from all options
    document.querySelectorAll('.song-option').forEach(opt =>
      opt.classList.remove('active')
    );

    // Add active class to selected option
    option.classList.add('active');

    // Update selected display
    const iconSvg = option.querySelector('.track-icon').outerHTML;
    const text = option.textContent.trim();
    selectedSong.querySelector('span').textContent = text;
    selectedSong.querySelector('.track-icon').outerHTML = iconSvg;

    // Handle audio play
    const audioPlayer = document.getElementById('audioPlayer');
    const file = option.dataset.file;
    if (file) {
      audioPlayer.src = file;
      
      if (!musicAudioCtx) {
        musicAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        musicSourceNode = musicAudioCtx.createMediaElementSource(audioPlayer);
        musicGainNode = musicAudioCtx.createGain();
        musicSourceNode.connect(musicGainNode);
        musicGainNode.connect(musicAudioCtx.destination);
      }
      
      // Slightly boost lofi volume!
      if (file.includes('lofi')) {
        musicGainNode.gain.value = 1.35; // 35% boost for lofi
      } else {
        musicGainNode.gain.value = 1.0; 
      }
      
      audioPlayer.play();
      document.getElementById('playBtn').innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    } else {
      audioPlayer.pause();
      audioPlayer.src = '';
      document.getElementById('playBtn').innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`;
    }

    // Close dropdown
    songDropdown.classList.remove('open');
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  songDropdown.classList.remove('open');
});

// Control button functionality
document.getElementById('backwardBtn').addEventListener('click', () => {
  const activeOption = document.querySelector('.song-option.active');
  if (activeOption && activeOption.previousElementSibling) {
    activeOption.previousElementSibling.click();
  }
});

document.getElementById('playBtn').addEventListener('click', () => {
  const audioPlayer = document.getElementById('audioPlayer');
  if (audioPlayer.src) {
    if (audioPlayer.paused) {
      audioPlayer.play();
      document.getElementById('playBtn').innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    } else {
      audioPlayer.pause();
      document.getElementById('playBtn').innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`;
    }
  }
});

document.getElementById('forwardBtn').addEventListener('click', () => {
  const activeOption = document.querySelector('.song-option.active');
  if (activeOption && activeOption.nextElementSibling) {
    activeOption.nextElementSibling.click();
  } else if (!activeOption) {
    document.querySelector('.song-option:nth-child(2)').click();
  }
});


// Expose the show function globally so you can call it from your playlist button
window.showMusicPlayer = showMusicPlayer;

window.addEventListener('beforeunload', () => {
  if (timerEl && timerEl.textContent && timerEl.textContent !== "00:00") {
    localStorage.setItem('savedTimerValue', timerEl.textContent);
    localStorage.setItem('savedTimerMode', currentMode);
  }
});

window.addEventListener('load', () => {
  const savedTime = localStorage.getItem('savedTimerValue');
  const savedMode = localStorage.getItem('savedTimerMode');
  
  if (savedTime && savedMode) {
    timerEl.textContent = savedTime;
    currentMode = savedMode;
    originalTime = secondsToTimeString(durations[currentMode] || 1200);
    
    // Update active mode button
    const modeButtons = document.querySelectorAll('.modes button');
    modeButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.trim() === currentMode) {
        btn.classList.add('active');
      }
    });
    
    localStorage.removeItem('savedTimerValue');
    localStorage.removeItem('savedTimerMode');
  }
});
