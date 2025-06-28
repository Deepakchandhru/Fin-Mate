const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); 

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

async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (err) {
            if (err.response && err.response.status === 429 && i < retries - 1) {
                console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; 
            } else {
                throw err;
            }
        }
    }
    throw new Error('Failed to fetch data after retries.');
}

router.get('/', async (req, res) => {
    try {
        const newsApiKey = "ac602c6c86f401792d968fe5375201d4";

        const cachedNews = cache.get('combinedNews');
        if (cachedNews) {
            console.log('Returning cached news data.');
            return res.json(cachedNews);
        }

        const businessNewsIndiaUrl = `https://gnews.io/api/v4/top-headlines?country=in&category=business&lang=en&apikey=${newsApiKey}`;
        const businessAndTechNewsUrl = `https://gnews.io/api/v4/top-headlines?country=us&category=business&lang=en&apikey=${newsApiKey}`;

        const businessNewsIndiaResponse = await fetchWithRetry(businessNewsIndiaUrl);

        const businessNewsIndia = businessNewsIndiaResponse.articles.map((article, index) => ({
            _id: `business-india-${index}`,
            title: article.title,
            content: article.description,
            source: article.source.name,
            publishedAt: article.publishedAt,
            timeDifference: calculateTimeDifference(article.publishedAt),
        }));

        const businessAndTechNewsResponse = await fetchWithRetry(businessAndTechNewsUrl);

        const businessAndTechNews = businessAndTechNewsResponse.articles.map((article, index) => ({
            _id: `business-tech-${index}`,
            title: article.title,
            content: article.description,
            source: article.source.name,
            publishedAt: article.publishedAt,
            timeDifference: calculateTimeDifference(article.publishedAt),
        }));

        const combinedNews = [...businessNewsIndia, ...businessAndTechNews].sort((a, b) => {
            return new Date(b.publishedAt) - new Date(a.publishedAt);
        });

        cache.set('combinedNews', combinedNews);
        res.json(combinedNews);
    } catch (err) {
        console.error('Error fetching news from NewsAPI:', err.message);
        res.status(500).json({ error: 'Failed to fetch news from NewsAPI.' });
    }
});

module.exports = router;