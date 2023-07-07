const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Token validation route
router.post('/verify', (req, res) => {
  const { token } = req.body;

  // Check if token is present
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Token is valid, get user information from the decoded token
    const { username, email, fullname, role } = decoded;

    // Return the user info and token validation status
    res.json({ valid: true, username, email, fullname, role });
  });
});

// Handle OPTIONS requests for CORS preflight
router.options('/verify', (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
