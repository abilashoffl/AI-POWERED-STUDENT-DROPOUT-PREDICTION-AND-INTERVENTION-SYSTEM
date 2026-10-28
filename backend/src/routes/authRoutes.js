const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getMe, updatePassword, updateCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/update-credentials', protect, updateCredentials);

module.exports = router;
