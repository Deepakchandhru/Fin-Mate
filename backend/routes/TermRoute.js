const express = require('express');
const Term = require('../models/db/Term');
const router = express.Router();

// Get terms by category
router.get('/:category', async (req, res) => {
    try {
        const terms = await Term.find({ category: req.params.category });
        res.status(200).json(terms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch terms' });
    }
});

module.exports = router;