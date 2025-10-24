const express = require('express');
const { createSession, startSession, getSession } = require('../controllers/session.controllers');
const router = express.Router();

router.post('/create', createSession);
router.post('/:id/start', startSession);
router.get('/:id', getSession);

module.exports = router;
