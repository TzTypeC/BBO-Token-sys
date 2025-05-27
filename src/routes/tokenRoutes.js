const express = require('express');
const router = express.Router();
const { generateTokenHandler, validateTokenHandler } = require('../controllers/tokenController'); // Pastikan fungsi ini diekspor dengan benar

router.post('/generate-token', generateTokenHandler);
router.get('/validate-token', validateTokenHandler);

module.exports = router;
