const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'localhost',     // Your MySQL host (usually localhost)
    user: 'root',          // Your MySQL username
    password: 'user',      // Your MySQL password (leave empty if you didn't set one)
    database: 'user_db',   // The database we created earlier
    port: 3306              // MySQL port
});

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createUserFinanceTable = `
CREATE TABLE IF NOT EXISTS user_finance (
    user_id INT,
    id INT AUTO_INCREMENT PRIMARY KEY,
    fixed_income DECIMAL(10, 2),
    variable_income DECIMAL(10, 2),
    fixed_expenses DECIMAL(10, 2),
    variable_expenses DECIMAL(10, 2),
    miscellaneous_expenses DECIMAL(10, 2),
    risk_appetite ENUM('High', 'Medium', 'Low') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');

    // Create the users table first
    db.query(createUsersTable, (err) => {
        if (err) throw err;
        console.log('Users table created or already exists');

        // Then create the user_finance table
        db.query(createUserFinanceTable, (err) => {
            if (err) throw err;
            console.log('User finance table created or already exists');
        });
    });
});

// Signup Route
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
        return res.status(400).send('Please provide all fields');
    }

    // Check if the username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        console.log('Checking for existing username:', username);

        if (err) throw err;
        console.log('Results of username check:', results);
        if (results.length > 0) {
            return res.status(400).send('Username already taken');
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) throw err;

            // Insert the new user into the database
            const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(sql, [username, email, hashedPassword], (err, result) => {
                if (err) throw err;
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
});

app.post('/login', (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM users', (err, results) => {
        if (err) throw err;
        if (results[0].count === 0) {
            return res.status(400).send('No users registered. Please sign up first.');
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('Please provide both username and password');
        }

        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            if (results.length === 0) {
                return res.status(400).send('Invalid username or password');
            }

            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (!isMatch) {
                    return res.status(400).send('Invalid username or password');
                }
                res.status(200).json({ message: 'Login successful', username: user.username });
            });
        });
    });
});


// Clear Users Route
app.delete('/clear-users', (req, res) => {
    db.query('DELETE FROM users', (err, result) => {
        console.log('User data cleared, result:', result);

        if (err) {
            return res.status(500).json({ message: 'Error clearing user data' });
        }
        res.status(200).json({ message: 'User data cleared successfully' });
    });
});

app.post('/user-finance', (req, res) => {
    const { fixed_income, variable_income, fixed_expenses, variable_expenses, miscellaneous_expenses, risk_appetite } = req.body;

    if (!fixed_income || !variable_income || !fixed_expenses || !variable_expenses || !miscellaneous_expenses || !risk_appetite) {
        return res.status(400).send('Please provide all fields');
    }

    const sql = 'INSERT INTO user_finance (fixed_income, variable_income, fixed_expenses, variable_expenses, miscellaneous_expenses, risk_appetite) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [fixed_income, variable_income, fixed_expenses, variable_expenses, miscellaneous_expenses, risk_appetite], (err, result) => {
        if (err) return res.status(500).send('Database error');
        res.status(201).json({ message: 'Financial data saved successfully' });
    });
});

app.get('/get-username', (req, res) => {
    const userId = req.query.user_id; // Get user ID from query parameters

    const sql = 'SELECT username FROM users WHERE id = ? LIMIT 1';
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.length === 0) return res.status(404).json({ error: 'No user found' });

        res.json({ username: result[0].username });
    });
});



const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
