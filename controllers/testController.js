const Test = require('../models/Test');
const Question = require('../models/Question');
const Answer = require('../models/Answer');




// Function to create a test
exports.createTest = async (req, res) => {
    try {
        const { title, date, time, examTimeSpan, questions } = req.body;
        const teacherId = req.user._id; // Assumes you have user authentication in place

        // Create and save the test
        const test = new Test({
            title,
            date,
            time,
            duration: examTimeSpan,
            teacher: teacherId,
        });

        const savedTest = await test.save();

        // Save questions to the database and link them to the test
        for (const question of questions) {
            const questionDoc = new Question({
                ...question,
                test: savedTest._id
            });
            await questionDoc.save();
            savedTest.questions.push(questionDoc._id);
        }

        // Update the test with the questions
        await savedTest.save();

        res.status(201).json({ message: 'Test created successfully', test: savedTest });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating test' });
    }
};

//for student side
exports.getTest = async (req, res) => {
    try {
      const { testId } = req.params;
      const test = await Test.findById(testId).populate('questions');
  
      if (!test) return res.status(404).json({ error: 'Test not found' });
      res.json(test);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching test' });
    }
  };
  //for handling real-time answering (Individual ansers)
  exports.getScheduledTests = async (req, res) => {
    try {
        const studentId = req.user.id; // Assuming req.user contains the logged-in user's info
        const tests = await Test.find({ students: studentId }) // Fetch tests where the student is enrolled
            .populate('teacher', 'username') // Populate the teacher's username
            .select('title teacher'); // Select only the title and teacher fields

        if (!tests || tests.length === 0) {
            return res.status(404).json({ message: 'No scheduled tests found.' });
        }

        // Format the tests to include teacher's username
        const formattedTests = tests.map(test => ({
            id: test._id, // Test ID
            title: test.title,
            teacher: test.teacher.username, // Teacher's username
        }));

        return res.status(200).json(formattedTests);
    } catch (error) {
        console.error('Error fetching scheduled tests:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
  //for handling Auto-submission and final scoring
  exports.submitTest = async (req, res) => {
    try {
      const { testId } = req.params;
      const studentId = req.user._id;
  
      // Fetch answers and calculate score
      const answers = await Answer.find({ test: testId, student: studentId });
      const correctAnswers = answers.filter(ans => ans.isCorrect).length;
      const totalQuestions = await Question.countDocuments({ test: testId });
  
      res.json({
        message: `Test submitted. Your score: ${correctAnswers}/${totalQuestions}`,
        score: correctAnswers,
        totalQuestions
      });
    } catch (error) {
      res.status(500).json({ error: 'Error submitting test' });
    }
  };
// Get all tests created by teachers for students
exports.getAllTests = async (req, res) => {
    try {
      const tests = await Test.find().populate('teacher', 'username'); // Populate teacher username
      res.json(tests);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching tests' });
    }
  };
  
    
  
  