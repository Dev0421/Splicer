require('dotenv').config();
let Backend_Link = 'http://localhost:3000';
async function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
        showCustomAlert("Please enter both email and password.");
        return;
    }

    if(localStorage.getItem("Backend_Link")=== 'http://147.93.118.209:5000') {
        try {
            const response = await fetch(`http://localhost:3000/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Corrected to use `email`, not `username`
            });
    
            const data = await response.json();
    
            if (response.ok) {
                localStorage.setItem("offline_token", data.token);
                localStorage.setItem("offline_userId", data.user.id);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
    
    try {
        const response = await fetch(`${localStorage.getItem("Backend_Link")}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), // Corrected to use `email`, not `username`
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("email", data.user.email);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user.id);
            console.log(data);
            showCustomAlert("Login successful!");
            setTimeout(() => {
                redirectToPage('dashboard.html'); // Redirect to dashboard after login
            }, 1500);
            
        } else {
            showCustomAlert(data.error);
            console.error(data.error);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        showCustomAlert("Server error. Please try again later.");
    }

    
}

function updateStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const isOnline = navigator.onLine; // Check online status
    statusIndicator.style.backgroundColor = isOnline ? 'green' : 'red';

    const onlineRadio = document.getElementById('online');
    const offlineRadio = document.getElementById('offline');

    if (!isOnline) {
        onlineRadio.disabled = true;
        offlineRadio.checked = true;
        offlineRadio.disabled = false; // Ensure offline can still be selected
    } else {
        onlineRadio.disabled = false;
        offlineRadio.disabled = false; // Allow both to be selectable
    }
}

function handleRadioChange() {
    const offlineRadio = document.getElementById('offline');
    const isOnline = !offlineRadio.checked;
    if(isOnline) 
        Backend_Link = 'http://147.93.118.209:5000';
    else
        Backend_Link = 'http://localhost:3000';
    localStorage.setItem("Backend_Link", Backend_Link);
}

// Attach event listeners to radio buttons

document.getElementById('online').addEventListener('change', handleRadioChange);
document.getElementById('offline').addEventListener('change', handleRadioChange);

setInterval(updateStatus, 3000);
updateStatus();

document.addEventListener('DOMContentLoaded', () => {
        Backend_Link = 'http://localhost:3000';
        localStorage.setItem("Backend_Link", 'http://localhost:3000');
    updateStatus();
});