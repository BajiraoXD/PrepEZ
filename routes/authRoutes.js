const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register user
router.post('/signup', authController.registerUser);

// Login user
router.post('/login', authController.loginUser);

//Login teacher
router.post('/tlogin', authController.loginT);
// Register user
router.post('/tsignup', authController.registerT);

// Google login callback
router.post('/google', authController.googleLogin);

module.exports = router;
