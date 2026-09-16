const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-app.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Temporary in-memory database array for testing
let expenses = [];

// 1. GET: Fetch all expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// 2. POST: Add a new expense
app.post('/api/expenses', (req, res) => {
  const { title, amount, category, expenseDate } = req.body;
  
  const newExpense = {
    id: Date.now(), // Simple unique ID
    title,
    amount: parseFloat(amount),
    category,
    expenseDate
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// 3. DELETE: Remove an expense by ID
app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  expenses = expenses.filter(exp => exp.id !== id);
  res.status(200).json({ message: 'Expense deleted successfully' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});