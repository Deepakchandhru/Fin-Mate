const express = require('express');
const axios = require('axios');

const router = express.Router();

// Helper function to calculate time difference
function calculateTimeDifference(publishedAt) {
    const now = new Date();
    const publishedDate = new Date(publishedAt);
    const diffInMs = now - publishedDate;

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
}

// Fetch news from NewsAPI
router.get('/', async (req, res) => {
    try {
        const apiKey = "fd1399da017147829c7f27ac70114471"; // Add your NewsAPI key to the .env file

        // Correct URLs for fetching business news in India and business + technology news globally
        const businessNewsIndiaUrl = `https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=${apiKey}`;
        const businessAndTechNewsUrl = `https://newsapi.org/v2/top-headlines?category=business,technology&apiKey=${apiKey}`;

        console.log("Fetching business news in India from:", businessNewsIndiaUrl);
        const businessNewsIndiaResponse = await axios.get(businessNewsIndiaUrl);
        console.log("Business news in India response received:", businessNewsIndiaResponse.data);

        const businessNewsIndia = businessNewsIndiaResponse.data.articles.map((article, index) => ({
            _id: `business-india-${index}`, // Unique ID for business news in India
            title: article.title,
            content: article.description,
            source: article.source.name,
            publishedAt: article.publishedAt,
            timeDifference: calculateTimeDifference(article.publishedAt),
        }));

        console.log("Fetching business and technology news globally from:", businessAndTechNewsUrl);
        const businessAndTechNewsResponse = await axios.get(businessAndTechNewsUrl);
        console.log("Business and technology news response received:", businessAndTechNewsResponse.data);

        const businessAndTechNews = businessAndTechNewsResponse.data.articles.map((article, index) => ({
            _id: `business-tech-${index}`, // Unique ID for business and technology news
            title: article.title,
            content: article.description,
            source: article.source.name,
            publishedAt: article.publishedAt,
            timeDifference: calculateTimeDifference(article.publishedAt),
        }));

        // Combine the results
        const combinedNews = [...businessNewsIndia, ...businessAndTechNews];
        console.log("Combined news:", combinedNews);

        res.json(combinedNews);
    } catch (err) {
        console.error('Error fetching news from NewsAPI:', err.message);
        res.status(500).json({ error: 'Failed to fetch news from NewsAPI.' });
    }
});

module.exports = router;