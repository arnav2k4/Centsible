function fetchUserData() {
    fetch('http://localhost:3000/users') // Adjust the endpoint as necessary
        .then(response => response.json())
        .then(data => {
    const usernameInput = document.getElementById('username');
    usernameInput.value = data.username; // Set the username input field with the logged-in user's username
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.innerHTML = `<h2>User Information</h2>
                                      <p>Email: ${data.email}</p>`;

        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

function nextPage() {
    const fixedIncome = document.getElementById('fixed-income').value;
    const variableIncome = document.getElementById('variable-income').value;
    const fixedExpenses = document.getElementById('fixed-expenses').value;
    const variableExpenses = document.getElementById('variable-expenses').value;
    const miscellaneousExpenses = document.getElementById('miscellaneous-expenses').value;
    const riskAppetite = document.getElementById('risk-appetite').value;

    if (fixedIncome && variableIncome && fixedExpenses && variableExpenses && miscellaneousExpenses && riskAppetite) {
        const data = {
            fixed_income: parseFloat(fixedIncome),
            variable_income: parseFloat(variableIncome),
            fixed_expenses: parseFloat(fixedExpenses),
            variable_expenses: parseFloat(variableExpenses),
            miscellaneous_expenses: parseFloat(miscellaneousExpenses),
            risk_appetite: riskAppetite // ✅ Add Risk Appetite
        };

        fetch('http://localhost:3000/user-finance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert('Data Submitted Successfully!');
                window.location.href = 'next-page.html';
            } else {
                alert('Error submitting data. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting data. Please try again.');
        });
    } else {
        alert('Please fill out all fields.');
    }
}


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
            alert('Login successful!');
            console.log('Redirecting to dashboard...');

            // ✅ Store username in Local Storage
            localStorage.setItem("usern", document.getElementById('login-username').value);

            setTimeout(() => {
                window.location.href = 'dashboard/index.html'; // Redirect after 1 sec
            }, 10);
        } else {
            alert('Error: ' + (data.error || 'Login failed.'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error logging in. Please try again.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');

    // ✅ Get username from Local Storage
    const ab = localStorage.getItem("usern");

    if (ab) {
        usernameInput.value = ab;
    } else {
        usernameInput.value = 'User not found';
    }
});