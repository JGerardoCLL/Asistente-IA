const express = require('express');
const { generateContent } = require('../controllers/chat.controller');

const router = express.Router();

router.post('/gemini', generateContent);

module.exports = router;