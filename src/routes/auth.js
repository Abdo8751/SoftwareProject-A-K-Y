const express = require('express');
const { register, login, forgetPassword } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/forgetPassword', forgetPassword);


module.exports = router;