const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
// const connectDB = require('./config/db');
const Test = require('./models/Test'); // Import your Test model here
const User = require('./models/User'); // Import User model
const Teacher = require('../models/Teacher'); // Import Teacher model
const Interview = require('./models/Interview'); // Import Interview model
const { isAuthenticated } = require('./middleware/auth'); // Import your auth middleware
require('dotenv').config();

const app = express();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};


// Connect to the database
connectDB();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Consider setting secure to true in production with HTTPS
}));

// Routes
app.use('/auth', require('./routes/authRoutes'));

// Frontend routes
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (user && user.password === password) {
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/home');
    } else {
        res.send('Invalid credentials');
    }
});

// Dashboard route
app.get('/home', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    try {
        const interviews = await Interview.find();
        res.render('home', { name: req.session.username, interviews });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).send('Error loading interviews');
    }
});

// Interview route
app.get('/Interview', (req, res) => {
    res.render('Interview');
});

// API route for creating tests
app.post('/api/tests', isAuthenticated, async (req, res) => {
    try {
        const { title, date, time, examTimeSpan, duration, questions } = req.body;

        // Log the incoming request body
        console.log('Incoming request body:', req.body);

        // Ensure questions are parsed correctly
        const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;

        // Log parsed questions to see the structure
        console.log('Parsed questions:', parsedQuestions);

        // Ensure options are treated as an array
        for (const question of parsedQuestions) {
            // Check if options is an array
            if (!Array.isArray(question.options)) {
                // If it's not, make sure to convert it to an array
                question.options = [question.options]; // Wrap single option in an array if needed
            }
        }

        // Log the questions after ensuring options are arrays
        console.log('Questions with ensured options as array:', parsedQuestions);

        const test = new Test({
            title,
            date,
            time,
            examTimeSpan,
            duration,
            questions: parsedQuestions,
            teacher: req.session.userId, // Use session user ID
            students: []
        });

        await test.save();

        res.status(201).json({ message: 'Test created successfully', test });
    } catch (error) {
        console.error('Error saving test:', error);
        res.status(500).json({ message: 'Error saving test', error: error.message });
    }
});

app.get('/api/tests/scheduled', async (req, res) => {
    try {
        // Fetch all tests from the database
        const tests = await Test.find()
            .populate('teacher', 'username') // Populate the teacher's username if needed
            .select('title teacher date duration'); // Select only the fields you want to return

        // Check if tests were found
        if (!tests || tests.length === 0) {
            return res.status(404).json({ message: 'No scheduled tests found.' });
        }

        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//to get test
// Assuming you have a Test model set up with questions
app.get('/tests/:testId', async (req, res) => {
    try {
        const testId = req.params.testId;
        const test = await Test.findById(testId).populate('teacher'); // Assuming you want to populate the teacher data

        if (!test) {
            return res.status(404).send('Test not found');
        }

        // Render the test structure EJS template
        res.render('Test_structure', { test });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/api/tests/:id', async (req, res) => {
    try {
        const testId = req.params.id;
        console.log("Received request for test ID:", testId);

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            console.log("Invalid ObjectId format:", testId);
            return res.status(400).json({ message: 'Invalid test ID format' });
        }

        const test = await Test.findById(testId);
        console.log("Fetched test:", test);

        if (!test) {
            console.log("Test not found for ID:", testId);
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json(test);
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ message: error.message });
    }
});
//route for accessing test 
app.get('/test_structure/:testId', async (req, res) => {
    try {
        const testId = req.params.testId;
        
        // Fetch the test and populate questions
        const test = await Test.findById(testId).populate('questions');
        
        if (!test) {
            return res.status(404).send('Test not found');
        }
        
        // Render test_structure page with the fetched test data
        res.render('test_structure', { test });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).send('Server error');
    }
});
  


// Route for students to view their scheduled tests
app.get('/tests', isAuthenticated, (req, res) => {
    res.render('Test'); // Renders Test.ejs
});

// Teacher login routes
app.get('/tlogin', (req, res) => res.render('tlogin'));

// Teacher login route
app.post('/tlogin', async (req, res) => {
    const { username, password } = req.body;
    console.log('Logging in with username:', username); // Log the username

    try {
        // Find the teacher by username
        const teacher = await Teacher.findOne({ username: username });
        console.log('Found teacher:', teacher); // Log the found teacher

        // Ensure to compare passwords securely in production (e.g., using bcrypt)
        if (teacher && teacher.password === password) {
            // Store user and teacher ID in session
            req.session.userId = teacher._id; // Store user ID in session
            req.session.username = teacher.username; // Store username in session
            req.session.teacherId = teacher._id; // Store teacher ID in session

            console.log('Session data after login:', req.session); // Log session data for debugging
            return res.redirect('/teachers-home'); // Redirect to the teacher's home page
        } else {
            console.log('Invalid credentials'); // Log invalid login attempt
            return res.send('Invalid credentials'); // Handle login failure
        }
    } catch (error) {
        console.error('Error during login:', error); // Log any errors that occur during login
        return res.status(500).send('Internal Server Error'); // Respond with a generic error message
    }
});

// Teachers home route
app.get('/teachers-home', async (req, res) => {
    console.log('Session data:', req.session); // Log session data for debugging

    // Check if the teacher is logged in
    if (!req.session.username) {
        return res.redirect('/tlogin'); // Redirect if user isn't logged in
    }

    try {
        // Fetch only interviews associated with the logged-in teacher's ID
        const teacherId = req.session.userId;
        console.log('Teacher ID from session:', teacherId); // Log teacher ID for debugging

        const interviews = await Interview.find({ teacherID: teacherId }); // Filter by teacherID
        console.log('Fetched interviews:', interviews); // Log fetched interviews

        res.render('teachers-home', { name: req.session.username, interviews }); // Pass data to template
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).send('Error loading interviews');
    }
});

// Dynamic join route for interview rooms
app.get('/join/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    const interviewUrl = `https://prepezchatappppppppppp.on.drv.tw/www.prepezchatapp.com/room.html?room=${roomId}`;
    res.redirect(interviewUrl);
});

// Teacher-profile route
app.get('/teacher_profile', async (req, res) => {
    // Check if the teacher is logged in
    if (!req.session.username) {
        return res.redirect('/tlogin'); // Redirect if user isn't logged in
    }

    // Get the username from the session
    const teacherName = req.session.username;

    // Render the teacher profile page and pass the teacher's name
    res.render('teacher_profile', { name: teacherName });
});

// Contact routes
app.get('/contact', async (req, res) => {
    res.render('contact');
});
app.get('/contact_s', async (req, res) => {
    res.render('contact_s');
});

// Test teacher side route
app.get('/Test-teacher', async (req, res) => {
    res.render('Test-teacher');
});

// Courses routes
app.get('/courses', async (req, res) => {
    res.render('courses');
});
app.get('/courses_s', async (req, res) => {
    res.render('courses_s');
});

// Student profile route
app.get('/profile', async (req, res) => {
    // Check if the teacher is logged in
    if (!req.session.username) {
        return res.redirect('/tlogin'); // Redirect if user isn't logged in
    }

    // Get the username from the session
    const Name = req.session.username;

    // Render the teacher profile page and pass the teacher's name
    res.render('profile', { name: Name });
});

// Quiz route
app.get('/quiz', async (req, res) => {
    res.render('Quiz');
});
// Student side test route
// Route to render the Test page for students
// Route for students to view their scheduled tests
app.get('/Test', isAuthenticated, (req, res) => {
    res.render('Test'); // Renders tests.ejs
});


// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

