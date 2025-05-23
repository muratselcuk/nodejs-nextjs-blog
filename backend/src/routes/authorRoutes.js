const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.get('/', authorController.getAuthor);
router.put('/', authorController.updateAuthor);

module.exports = router;
