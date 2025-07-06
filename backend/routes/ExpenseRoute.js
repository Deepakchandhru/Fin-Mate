const express = require('express');
const axios = require('axios');
const Expense = require('../models/db/Expense');

const router = express.Router();

// Fetch expenses for a user
router.get('/:user_id', async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: req.params.user_id });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add an expense
router.post('/', async (req, res) => {
    try {
        const { user_id, expense_name, amount } = req.body;
        const expense = new Expense({ user_id, expense_name, amount });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Classify expenses
router.get('/classify/:user_id', async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: Number(req.params.user_id) });

        if (expenses.length === 0) {
            return res.status(404).json({ error: 'No expenses found for this user.' });
        }

        const expenseData = expenses.map(expense => ({
            expense_name: expense.expense_name,
            amount: expense.amount,
            date: expense.date
        }));

        const pythonResponse = await axios.post('http://127.0.0.1:8080/predict', expenseData);

        const categorizedExpenses = expenses.map((expense, index) => ({
            ...expense._doc,
            category: pythonResponse.data[index].predicted_category
        }));

        res.json({ categorizedExpenses });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to classify expenses.' });
    }
});

// Analyze expenses
router.get('/analyze/:user_id', async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: Number(req.params.user_id) });

        if (expenses.length === 0) {
            return res.status(404).json({ error: 'No expenses found for this user.' });
        }

        const expenseData = expenses.map(expense => ({
            expense_name: expense.expense_name,
            amount: expense.amount,
            date: expense.date
        }));

        // Fetch classified expenses from the Python model
        const pythonResponse = await axios.post('http://127.0.0.1:8080/predict', expenseData);

        const categorizedExpenses = expenses.map((expense, index) => ({
            ...expense._doc,
            category: pythonResponse.data[index].predicted_category
        }));

        // Perform analysis on the classified expenses
        const totalSpent = categorizedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        const analysis = categorizedExpenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = { amount: 0, percentage: 0 };
            }
            acc[category].amount += expense.amount;
            return acc;
        }, {});

        // Calculate percentage for each category
        for (const category in analysis) {
            analysis[category].percentage = ((analysis[category].amount / totalSpent) * 100).toFixed(2);
        }

        res.json({ totalSpent, analysis });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to analyze expenses.' });
    }
});

// Generate summary and suggestions
router.get('/summary/:user_id', async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: Number(req.params.user_id) });

        if (expenses.length === 0) {
            return res.status(404).json({ error: 'No expenses found for this user.' });
        }

        const expenseData = expenses.map(expense => ({
            expense_name: expense.expense_name,
            amount: expense.amount,
            date: expense.date
        }));

        // Fetch classified expenses from the Python model
        const pythonResponse = await axios.post('http://127.0.0.1:8080/predict', expenseData);

        const categorizedExpenses = expenses.map((expense, index) => ({
            ...expense._doc,
            category: pythonResponse.data[index].predicted_category
        }));

        // Perform analysis on the classified expenses
        const analysis = categorizedExpenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += expense.amount;
            return acc;
        }, {});

        const totalSpent = Object.values(analysis).reduce((sum, amount) => sum + amount, 0);

        // Call Groq AI API for suggestions
        const fetchGroqSuggestions = async (analysis, totalSpent) => {
            try {
                const response = await axios.post('http://127.0.0.1:8080/suggestions', {
                    analysis,
                    totalSpent
                });
                return response.data.suggestions;
            } catch (error) {
                console.error('Failed to fetch Groq AI suggestions:', error.message);
                return ['Unable to fetch suggestions at this time.'];
            }
        };

        const suggestions = await fetchGroqSuggestions(analysis, totalSpent);

        res.json({
            totalSpent,
            categorizedExpenses: analysis,
            suggestions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to generate summary.' });
    }
});

module.exports = router;