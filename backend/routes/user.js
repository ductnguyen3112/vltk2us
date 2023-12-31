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


router.post('/rename', (req, res) => {
  const oldName = req.body.oldname;
  const newName = req.body.newname;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const query = `SELECT * FROM role WHERE RoleName = ?`;

    connection.query(query, [oldName], (err, results) => {
      if (err) {
        console.error('Error executing the query');
        res.status(500).json({ error: 'Internal Server Error' });
        connection.release();
        return;
      }

      if (results.length === 0) {
        res.send('Rolename Not Exist');
      } else {
        const accountData = results[0];

        let fullInfoHex = Buffer.from(accountData.FullInfo, 'binary').toString('hex');
        let listItemHex = Buffer.from(accountData.ListItem, 'binary').toString('hex');

        const oldNameHex = Buffer.from(oldName, 'utf8').toString('hex');
        const newNameHex = Buffer.from(newName, 'utf8').toString('hex').padEnd(oldNameHex.length, '0');

        fullInfoHex = fullInfoHex.replace(oldNameHex, newNameHex);
        listItemHex = listItemHex.replace(oldNameHex, newNameHex);

        const updateQuery = `UPDATE role SET RoleName = ?, FullInfo = x'${fullInfoHex}', ListItem = x'${listItemHex}' WHERE RoleName = ?`;

        connection.query(updateQuery, [newName, oldName], (err, updateResult) => {
          connection.release();

          if (err) {
            console.error('Error executing the update query');
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          if (updateResult.affectedRows > 0) {
            res.send('Success');
          } else {
            res.send('Data not changed');
          }
        });
      }
    });
  });
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

    // Construct the SQL query to check username existence
    const checkQuery = 'SELECT COUNT(*) AS count FROM account WHERE username = ?';
    // Construct the SQL query to insert user data
    const insertQuery = 'INSERT INTO account (username, email, password, secpassword, fullname, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)';

    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Execute the query to check username existence
    paysys.query(checkQuery, [username], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error executing the username check query', checkErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Check if username already exists
      if (checkResult[0].count > 0) {

        return res.status(400).json({ error: 'Username already exists' });
       
        
      }

      // Execute the query to insert user data
      paysys.query(insertQuery, [username, email, hashedPassword, hashedSecPassword, fullname, currentTimestamp, currentTimestamp], (err, result) => {
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
     // console.log('Payment is completed', username, coins);
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
            res.status(500).json({ status: 'error', message: 'Error updating the coin value' });
          } else {
            // Handle the successful update if needed
           // console.log('Coin value updated successfully:', result);
            res.status(200).json({ status: 'success', message: 'Payment is completed' });
          }
        });
      } catch (error) {
        console.error('Error updating the coin value:', error);
        // Handle the error if needed
        res.status(500).json({ status: 'error', message: 'Error updating the coin value' });
      }
    } else {
      console.log('Payment is not completed');
      // Handle other payment statuses accordingly

      // Example: Update the payment status in your database
      await updatePaymentStatus(orderID, 'INCOMPLETE');
      res.status(200).json({ status: 'success', message: 'Payment is not completed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);

    // Example: Update the payment status in your database
    await updatePaymentStatus(req.body.orderID, 'ERROR');
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
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
         // console.log('napthe table updated successfully:', naptheResult);
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



