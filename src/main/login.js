async function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
        showCustomAlert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
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