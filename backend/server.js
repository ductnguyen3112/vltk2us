const express = require('express');
const app = express();
const userRouter = require('./routes/user');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse JSON bodies
app.use(express.json());

// Route to render the index view
app.get('/', (req, res) => {
  res.render('index');
});

// API routes
app.use('/api', userRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
