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
