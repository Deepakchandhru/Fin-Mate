const mongoose = require('mongoose');

const TermSchema = new mongoose.Schema({
    term: { type: String, required: true },
    definition: { type: String, required: true },
    scenario_based_explanation: { type: String },
    category: { type: String, required: true },
}, {collection: 'Terms'});

module.exports = mongoose.model('Terms', TermSchema);