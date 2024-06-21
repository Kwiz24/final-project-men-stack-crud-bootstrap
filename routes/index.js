const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Home Page
router.get('/', (req, res) => res.render('index'));

// Music Page
router.get('/music', (req, res) => res.render('music'));

// Videos Page
router.get('/videos', (req, res) => res.render('videos'));

// Genres Page
router.get('/genres', (req, res) => res.render('genres'));

module.exports = router;
