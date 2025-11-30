const express = require('express');
const app = express();
const cors = require("cors")
const bodyParser = require("body-parser")
const mysql = require('mysql2');

const port = 4000;

app.use(bodyParser.json())
app.use(cors())

const db = mysql.createConnection({
    host: "localhost",
    user: "gireendra",
    password: "Giri@332",
    database: "todolist",
})

db.connect((err) => {
    if (err) {
        console.log("error while connecting to database", err);
        return
    }
    console.log("connected to the mysql database...")
})



// Create new user
app.post("/signup", (req, res) => {
    console.log("Signup request:", req.body);

    const { email, password, confirmPassword } = req.body;

    // Validate input
    if (!email || email.trim().length === 0) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if user already exists
    db.query(
        'SELECT id FROM users WHERE email = ?',
        [email.trim()],
        (err, results) => {
            if (err) {
                console.error("Error checking email:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: "Email already registered" });
            }

            // Insert new user (in production, you should hash the password)
            db.query(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email.trim(), password],
                (err, result) => {
                    if (err) {
                        console.error("Error creating user:", err);
                        return res.status(500).json({ error: "Failed to create account" });
                    }

                    console.log("User created successfully with ID:", result.insertId);
                    res.json({
                        success: true,
                        userId: result.insertId,
                        email: email.trim(),
                        message: "Account created successfully"
                    });
                }
            );
        }
    );
});

//Verify email and password
app.post("/login", (req, res) => {
    console.log("Login request:", req.body);

    const { email, password } = req.body;

    // Validate input
    if (!email || email.trim().length === 0) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!password || password.length === 0) {
        return res.status(400).json({ error: "Password is required" });
    }

    // Find user by email and password
    db.query(
        'SELECT id, email FROM users WHERE email = ? AND password = ?',
        [email.trim(), password],
        (err, results) => {
            if (err) {
                console.error("Error querying user:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const user = results[0];
            console.log("Login successful for user:", user.email);

            res.json({
                success: true,
                userId: user.id,
                email: user.email,
                message: "Login successful"
            });
        
        }
    );
});

//TODOS 

app.get("/todos/:userId", (req, res) => {
    console.log("Fetching todos for user:", req.params.userId);

    const userId = req.params.userId;

    // Validate userId
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Valid user ID is required" });
    }

    db.query(
        'SELECT * FROM todoItems WHERE userId = ? ORDER BY createdAt DESC',
        [userId],
        (err, result) => {
            if (err) {
                console.error("Error fetching todos:", err);
                return res.status(500).json({ error: "Failed to fetch todos" });
            }
            console.log("Todos fetched for user:", userId, result);
            res.json(result);
        }
    );
});


app.post("/todos", (req, res) => {
    console.log("Adding new todo:", req.body);

    const { itemDescription, complete, userId } = req.body;

    // Validate input
    if (!itemDescription || itemDescription.trim().length === 0) {
        return res.status(400).json({ error: "Todo description is required" });
    }
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // Use prepared statement to prevent SQL injection
    db.query(
        'INSERT INTO todoItems (itemDescription, completed, edit, userId) VALUES (?, ?, ?, ?)',
        [itemDescription.trim(), complete === true || complete === 'true' ? 1 : 0, 1, userId],
        (err, result) => {
            if (err) {
                console.error("Error inserting todo:", err);
                return res.status(500).json({ error: "Failed to add todo" });
            }
            console.log("Todo added successfully with ID:", result.insertId);
            res.json({
                success: true,
                id: result.insertId,
                message: "Todo added successfully"
            });
        }
    );
});

app.put("/todos/:id", (req, res) => {
    console.log("Updating todo ID:", req.params.id, "with data:", req.body);

    const todoId = req.params.id;
    const { text, edit, done } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Todo text is required" });
    }

    // Use prepared statement to prevent SQL injection
    db.query(
        'UPDATE todoItems SET itemDescription = ?, edit = ?, completed = ? WHERE id = ?',
        [text.trim(), edit ? 1 : 0, done ? 1 : 0, todoId],
        (err, result) => {
            if (err) {
                console.error("Error updating todo:", err);
                return res.status(500).json({ error: "Failed to update todo" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Todo not found" });
            }
            console.log("Todo updated successfully");
            res.json({ success: true, message: "Todo updated successfully" });
        }
    );
});


app.delete("/todos/:id", (req, res) => {
    console.log("Deleting todo ID:", req.params.id);

    const todoId = req.params.id;

    // Use prepared statement to prevent SQL injection
    db.query(
        'DELETE FROM todoItems WHERE id = ?',
        [todoId],
        (err, result) => {
            if (err) {
                console.error("Error deleting todo:", err);
                return res.status(500).json({ error: "Failed to delete todo" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Todo not found" });
            }
            console.log("Todo deleted successfully");
            res.json({ success: true, message: "Todo deleted successfully" });
        }
    );
});



app.listen(port, () => {
    console.log("app is running on port", port, ".....");
});

