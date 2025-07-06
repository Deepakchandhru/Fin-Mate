const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user_id: Number,
    expense_name: String,
    amount: Number,
    date: { type: Date, default: Date.now }
},  { collection: 'Expense' });

module.exports = mongoose.model('Expense', ExpenseSchema);
