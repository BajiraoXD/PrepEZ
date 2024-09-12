const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register user
router.post('/signup', authController.registerUser);
//Landing page
// Login user
router.post('/login', authController.loginUser);

//interview


// Google login callback
router.post('/google', authController.googleLogin);

module.exports = router;
