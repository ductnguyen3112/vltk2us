const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const JWT_SECRET = process.env.PRIVATE_KEY;


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

        // Generate JWT token
        let token;

        try {
          token = jwt.sign(
            {
              username: user.username,
              email: user.email,
              fullname: user.fullname,
              role: user.role
            },
            JWT_SECRET,
            { expiresIn: '1h' }
          );

          // console.log('Generated token:', token); // Log the generated token for debugging
        } catch (err) {
          console.error('Error generating JWT', err);
        }


        return res.status(200).json({ token, username, email, fullname, role });
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
  console.log(username, secpassword, password)
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



// POST route for handling payment success
router.post('/payment', async (req, res) => {
  try {
    const { orderID, facilitatorAccessToken, username, coins } = req.body;

    // Verify the payment using PayPal API
    const response = await axios.get(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
      headers: {
        Authorization: `Bearer ${facilitatorAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const paymentStatus = response.data.status;

    if (paymentStatus === 'COMPLETED') {
      console.log('Payment is completed', username, coins);
      // Perform further actions for a completed payment

      // Example: Update the payment status in your database
      await updatePaymentStatus(orderID, username, coins, 'COMPLETED');

      try {
        const updateQuery = 'UPDATE account SET coin = coin + ? WHERE username = ?';
        const updateValues = [coins, username];

        // Execute the update query using the pool
        paysys.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            console.error('Error executing the update query:', err);
            // Handle the error if needed
          } else {
            // Handle the successful update if needed
            console.log('Coin value updated successfully:', result);
          }
        });
      } catch (error) {
        console.error('Error updating the coin value:', error);
        // Handle the error if needed
      }
    } else {
      console.log('Payment is not completed');
      // Handle other payment statuses accordingly

      // Example: Update the payment status in your database
      await updatePaymentStatus(orderID, 'INCOMPLETE');
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);

    // Example: Update the payment status in your database
    await updatePaymentStatus(req.body.orderID, 'ERROR');

    res.sendStatus(500);
  }
});

async function updatePaymentStatus(orderID, username, coins, paymentStatus) {
  if (paymentStatus === 'COMPLETED') {
    try {
      const naptheQuery = 'INSERT INTO napthe (payment, username, amount, status) VALUES (?, ?, ?, ?)';
      const naptheValues = [orderID, username, coins, paymentStatus];


      // Execute the napthe table update query using the pool
      paysys.query(naptheQuery, naptheValues, (naptheErr, naptheResult) => {
        if (naptheErr) {
          console.error('Error executing the napthe table update query:', naptheErr);
          // Handle the error if needed
        } else {
          // Handle the successful napthe table update if needed
          console.log('napthe table updated successfully:', naptheResult);
        }
      });
    } catch (error) {
      console.error('Error updating the napthe table:', error);
      // Handle the error if needed
    }
  } else {
    // Handle other payment statuses if needed
  }
}

module.exports = router;



