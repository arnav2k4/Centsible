function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
}

// Initially show the login form
document.getElementById('login-form').classList.add('active');

// Handle Signup
function signupUser(event) {
    event.preventDefault();

    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Check if the username already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert('Username already taken.');
        return;
    }

    // Save new user to localStorage
    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful!');
    toggleForm();  // Switch to login form

    fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        alert('Signup successful!');
        toggleForm();  // Switch to login form
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
}

// Handle Login
function loginUser(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            alert(username + ' login successful');
            console.log('Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = 'indexdash.html'; // Redirect with delay
            }, 10); // 1-second delay for user experience
        } else {
            alert('Error: ' + (data.error || 'Login failed.'));
        }
        
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error logging in. Please try again.');
    });
}

