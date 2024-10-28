const express = require('express');
const testController = require('../controllers/testController');
const { isAuthenticated } = require('../middleware/auth'); // Import your auth middleware
const router = express.Router();

// Route for teacher to create a test
router.post('/create-test', testController.createTest);

// Route for fetching scheduled tests for the logged-in student
router.get('/scheduled', isAuthenticated, testController.getScheduledTests); // New route

module.exports = router;
