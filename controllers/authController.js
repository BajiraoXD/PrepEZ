const User = require('../models/User');
const Teacher = require('../models/teacher');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//students
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.redirect('/login'); // Redirect back to login page after signup
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Set session variables after successful login
        req.session.userId = user._id; // Store user ID in session
        req.session.username = user.username; // Store username in session

        res.redirect('/home'); // Redirect to homepage
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.googleLogin = async (req, res) => {
    const { id_token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                googleId: sub,
                username: name,
                email,
                password: '',
            });
            await user.save();
        }

        // Set session variables for Google login
        req.session.userId = user._id; // Store user ID in session
        req.session.username = user.username; // Store username in session

        res.status(200).json({ token: id_token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Google login failed');
    }
};
//teacher
exports.registerT = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let teacher = await Teachers.findOne({ email });

        if (teacher) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        teacher = new Teachers({
            username,
            email,
            password,
        });

        const sal = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(password, sal);

        await teacher.save();
        res.redirect('/tlogin'); // Redirect back to login page after signup
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginT = async (req, res) => {
    const { email, password } = req.body;

    try {
        const teacher = await Teachers.findOne({ email });

        if (!teacher) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Set session variables after successful login
        req.session.userId = teacher._id; // Store user ID in session
        req.session.username = teacher.username; // Store username in session

        res.redirect('/teachers-home'); // Redirect to homepage
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.googleLogin = async (req, res) => {
    const { id_token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name } = payload;

        let teacher = await Teacher.findOne({ email });

        if (!teacher) {
            teacher = new Teacher({
                googleId: sub,
                username: name,
                email,
                password: '',
            });
            await teacher.save();
        }

        // Set session variables for Google login
        req.session.userId = teacher._id; // Store user ID in session
        req.session.username = teacher.username; // Store username in session

        res.status(200).json({ token: id_token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Google login failed');
    }
};
