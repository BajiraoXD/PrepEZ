const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set view engine to EJS
app.set('view engine', 'ejs');


app.use(express.static('public'));

// Routes
app.use('/auth', require('./routes/authRoutes'));

// Frontend routes
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
// app.get('/register', (req, res) => res.render('register'));
app.get('/home_student', (req, res) => res.render('home_student'));
app.get('/quiz', (req, res) => res.render('quiz'));
app.get('/vc', (req, res) => {
    console.log('VC route accessed');
    res.render('vc');
});

app.get('/lobby', (req, res) => res.render('lobby'));
app.get('/room', (req, res) => res.render('room'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
