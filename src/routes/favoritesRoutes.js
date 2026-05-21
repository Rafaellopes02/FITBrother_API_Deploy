const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');

router.post('/toggle', toggleFavorite);
router.get('/:trainerId', getFavorites);

module.exports = router;