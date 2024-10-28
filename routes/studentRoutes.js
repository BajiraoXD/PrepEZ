const express = require('express');
const studentController = require('../controllers/studentController');
const router = express.Router();

router.get('/tests', studentController.getAllTests); // Get all tests for students

module.exports = router;
