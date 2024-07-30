const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Expense = require('./models/Expense');
const authenticateToken = require('./middleware/auth');
const path = require('path');
const generatePdf = require('./utils/generatePdf');
const sendEmail = require('./utils/sendmail');
const fs = require('fs');
const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret';

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// User Registration  
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body; 
  if (!email || !password  === undefined) {
    return res.status(400).json({ message: 'Email, password, and income are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });    
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


// Get User Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const extractNameFromEmail = (email) => {
      if (!email || !email.includes('@')) {
        return '';
      }
      const localPart = email.split('@')[0];
      const name = localPart.replace(/[._]/g, ' ');
      return name.charAt(0).toUpperCase() + name.slice(1);
    };
    const profile = {
      email: user.email,
      name: extractNameFromEmail(user.email),
    };
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update User Profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).json({ message: 'Email or password is required' });
  }

  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Expense Routes
app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { amount, category, date, description } = req.body;
  if (!amount || !category || !date) {
    return res.status(400).json({ message: 'Amount, category, and date are required' });
  }
  try {
    const expense = await Expense.create({
      amount,
      category,
      date,
      description,
      userId: req.user.id,
    });
    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.json({ expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount, category, date, description } = req.body;
  try {
    const expense = await Expense.findOne({ where: { id, userId: req.user.id } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description || expense.description;
    await expense.save();
    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findOne({ where: { id, userId: req.user.id } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send Expense Summary
app.post('/api/send-summary', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    const filePath = path.join(__dirname, 'summary.pdf');
    await generatePdf(expenses, filePath);
    await sendEmail(req.user.email, 'Expense Summary', 'Attached is your expense summary.', filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });
    res.json({ message: 'Summary sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/api/download-summary', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    const filePath = path.join(__dirname, 'summary.pdf');
    await generatePdf(expenses, filePath);
    res.download(filePath, 'summary.pdf', (err) => {
      if (err) {
        console.error('Failed to download file:', err);
      }
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to delete file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.use(express.json());

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });
