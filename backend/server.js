const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB Connection Error:", err));

const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

const expenseRoute = require('./routes/ExpenseRoute');
app.use('/api/expense', expenseRoute);

const newsRoute = require('./routes/NewsRoute');   
app.use('/api/news', newsRoute);

const termRoute = require('./routes/TermRoute');
app.use('/api/terms', termRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));