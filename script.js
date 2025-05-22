document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.modes button');

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            modeButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            button.classList.add('active');
        });
    });
});
