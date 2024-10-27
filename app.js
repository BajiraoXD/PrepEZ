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
app.get('login', (req, res) => res.render('login'));

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
const Interview = require('./models/Interview');

app.get('/home', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
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

app.post('/submit-interview', async (req, res) => {
    const { Name, Date: dateString, Time, roomid } = req.body;

    console.log("Form data received:", { Name, dateString, Time, roomid }); // Log received data for debugging

    try {
        // Convert the date string to a Date object
        const interviewDate = new Date(dateString);
        if (isNaN(interviewDate.getTime())) {
            return res.status(400).send('Invalid date format'); // Check for invalid date
        }

        // Check if teacherId is present in session
        const teacherId = req.session.userId; // or req.session.teacherId, depending on your session setup
        if (!teacherId) {
            return res.status(403).send('Teacher ID not found in session.'); // Handle case where teacher is not logged in
        }

        // Create a new interview instance
        const interview = new Interview({
            teacherID: teacherId, // Set teacherID from session
            Name,
            Date: interviewDate,
            Time,
            roomid
        });

        await interview.save();
        console.log('Interview saved:', interview);
        res.redirect('/teachers-home');
    } catch (error) {
        console.error('Error saving interview:', error); // Log the entire error object
        res.status(500).send(`Failed to save interview: ${error.message}`); // Handle the error with detailed message
    }
});



// Teachers login routes
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

//Teacher-profile
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

//contact
app.get('/contact',async(req,res)=>{
    res.render('contact');
});
app.get('/contact_s',async(req,res)=>{
    res.render('contact_s');
});
//test teacher side
app.get('/Test-teacher',async(req,res)=>{
    res.render('Test-teacher');
});
//courses
app.get('/courses',async(req,res)=>{
    res.render('courses');
});
app.get('/courses_s',async(req,res)=>{
    res.render('courses_s');
});
//student profile
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
//quiz
app.get('/quiz',async(req,res)=>{
    res.render('Quiz');
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



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
