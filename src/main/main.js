const { ipcRenderer } = require('electron');

function redirectToPage(page) {
    ipcRenderer.send('navigate-to-page', page);
}

function showCustomAlert(message) {
    let alertBox = document.getElementById("customAlert");
    let alertMessage = document.getElementById("alertMessage"); // Ensure there's an element for the message

    if (!alertBox || !alertMessage) {
        console.error("Custom alert elements not found!");
        return;
    }

    alertMessage.textContent = message; // Set the alert text
    alertBox.style.display = "block";

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}