const express = require('express');
const router = express.Router();
const { generateTokenHandler } = require('../controllers/tokenController'); // Pastikan fungsi ini diekspor dengan benar

// router.post('/generate-token', async (req, res) => {
//     try {
//         const token = await generateTokenHandler(req, res);
//         res.json({ token });
//     } catch (error) {
//         res.status(500).json({ error: 'Gagal membuat token' });
//         console.log(error)
//     }
// });

router.post('/generate-token', generateTokenHandler);
// router.get('/validate-token/token?', validateTokenHandler);

module.exports = router;
