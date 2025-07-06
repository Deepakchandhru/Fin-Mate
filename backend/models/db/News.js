const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    url: String
},{ collection: 'News'});

const News = mongoose.model('News', newsSchema);

module.exports = News;