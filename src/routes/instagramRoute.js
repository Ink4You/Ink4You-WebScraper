const express = require('express');
const router = express.Router();
const controller = require('../controllers/instagramController')
router.get('/:account', controller.get);
module.exports = router;