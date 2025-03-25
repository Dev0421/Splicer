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
    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();

        console.log(data);
        if (response.ok) {
            showCustomAlert(data.message); // Show success message
            setTimeout(() => {
                window.location.href = "login.html"; // Redirect after success
            }, 1500);
        } else {
            showCustomAlert(data.error); // Show error message from backend
            window.location.href = "login.html";
        }
    } catch (error) {
        showCustomAlert("Something went wrong. Please try again.");
        window.location.href = "login.html";
    }
}