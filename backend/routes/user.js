const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const crypto = require('crypto');

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

const paysys = mysql.createPool({
  host: process.env.PAYSYS_HOST,
  user: process.env.PAYSYS_USER,
  password: process.env.PAYSYS_PASSWORD,
  database: process.env.PAYSYS_DATABASE
});

// Registration
router.post('/register', (req, res) => {
  const { username, email, password, secpassword, fullname } = req.body;

  try {
    // Validate user input
    if (!username || !email || !password || !secpassword || !fullname) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the passwords using MD5
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    const hashedSecPassword = crypto.createHash('md5').update(secpassword).digest('hex');

    // Construct the SQL query
    const query = 'INSERT INTO account (username, email, password, secpassword, fullname, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)';

    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Execute the query using the pool
    paysys.query(query, [username, email, hashedPassword, hashedSecPassword, fullname, currentTimestamp, currentTimestamp], (err, result) => {
      if (err) {
        console.error('Error executing the registration query', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Check the result and send a response
      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Registration successful' });
      } else {
        return res.status(500).json({ error: 'Registration failed' });
      }
    });
  } catch (err) {
    console.error('Error in the registration process', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate user input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Hash the password using MD5
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    // Construct the SQL query
    const query = 'SELECT username, email, fullname, role FROM account WHERE username = ? AND password = ?';

    // Execute the query using the paysys pool
    paysys.query(query, [username, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error executing the login query', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Check the result and send a response
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      } else {
        const user = results[0];
        const { username, email, fullname, role } = user;
        return res.status(200).json({ username, email, fullname, role });
      }
    });
  } catch (err) {
    console.error('Error in the login process', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Password Reset
router.post('/password-reset', (req, res) => {
  const { username, secpassword, password } = req.body;
  console.log(username,secpassword,password)
  try {
    // Validate user input
    if (!username || !secpassword || !password) {
      return res.status(400).json({ error: 'Username, security password, and new password are required' });
    }

    // Verify secpassword (assuming it's hashed using MD5)
    const hashedSecPassword = crypto.createHash('md5').update(secpassword).digest('hex');
  
    // Construct the SQL query to verify secpassword
    const verifyQuery = 'SELECT * FROM account WHERE username = ? AND secpassword = ?';
  
    // Execute the query using the paysys pool
    paysys.query(verifyQuery, [username, hashedSecPassword], (err, verifyResult) => {
      if (err) {
        console.error('Error executing the secpassword verification query', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Check the verification result
      if (verifyResult.length === 0) {
        return res.status(401).json({ error: 'Invalid username or security password' });
      } else {
        // Hash the new password using MD5
        const hashedNewPassword = crypto.createHash('md5').update(password).digest('hex');

        // Construct the SQL query to update the password
        const updateQuery = 'UPDATE account SET password = ? WHERE username = ?';

        // Execute the query using the paysys pool
        paysys.query(updateQuery, [hashedNewPassword, username], (err, updateResult) => {
          if (err) {
            console.error('Error executing the password update query', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Check the result and send a response
          if (updateResult.affectedRows > 0) {
            return res.status(200).json({ message: 'Password reset successful' });
          } else {
            return res.status(500).json({ error: 'Password reset failed' });
          }
        });
      }
    });
  } catch (err) {
    console.error('Error in the password reset process', err);
    return res.status(500).json({ error: 'Internal Server' });
  }
});




module.exports = router;
