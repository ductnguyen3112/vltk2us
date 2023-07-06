const express = require('express');
const app = express();
const userRouter = require('./routes/user');
const tokenRouter = require('./routes/token');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Or specify your client's origin instead of "*"
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Add the Authorization header
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Add additional HTTP methods as needed
    next();
});

// Route to render the index view
app.get('/', (req, res) => {
  res.render('index');
});

// API routes
app.use('/api', userRouter);
app.use('/token', tokenRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
