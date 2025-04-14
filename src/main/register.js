require("dotenv").config();
async function register(event) {    
    event.preventDefault();

    let username = document.querySelector('input[type="text"]').value.trim();
    let email = document.querySelector('input[type="email"]').value.trim();
    let password = document.querySelector('input[type="password"]').value.trim();
    let confirmPassword = document.getElementById("confirmPassword").value.trim();

    let errors = [];
    if (!username) errors.push("Username is required.");
    if (!email) errors.push("Email is required.");
    if (!password) errors.push("Password is required.");
    if (!confirmPassword) errors.push("Confirm Password is required.");
    if (password !== confirmPassword) errors.push("Passwords do not match.");
    if (errors.length > 0) {
        showCustomAlert(errors.join("\n"), "error");
        return; 
    }
    if (!(navigator.onLine)) {
        showCustomAlert("You are offline. Please check your network connection.", "error");
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        const response2 = await fetch(`http://147.93.118.209:5000/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });
        const data2 = await response2.json();
        
        if (response.ok && response2.ok) {
            showCustomAlert(data.message); 
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            showCustomAlert(data.error); 
            window.location.href = "login.html";
        }
    } catch (error) {
        showCustomAlert("Something went wrong. Please try again.");
        window.location.href = "login.html";
    }
}