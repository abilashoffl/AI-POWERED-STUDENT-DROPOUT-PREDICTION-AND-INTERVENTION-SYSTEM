const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// CORS & Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/interventions', require('./routes/interventionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AI-Powered Student Dropout Prediction & Intervention System Backend API',
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.send('AI Student Dropout Risk Prediction System API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to DB then auto-seed if empty, then start listening
const startServer = async () => {
  await connectDB();

  // Auto-seed demo data if no admin account exists yet
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@college.edu' });
    if (!adminExists) {
      console.log('[Auto-Seed] No demo data found — running seeder...');
      const runSeed = require('./seedRunner');
      await runSeed();
    } else {
      console.log('[Auto-Seed] Demo data already present. Skipping seed.');
    }

    // Ensure student alex@student exists with password student@123
    let alexStudent = await User.findOne({ email: 'alex@student' });
    if (!alexStudent) {
      await User.create({
        name: 'Alex Vance',
        email: 'alex@student',
        password: 'student@123',
        role: 'student',
        studentId: 'ST1001'
      });
      console.log('✅ Created student user: alex@student / student@123');
    } else {
      alexStudent.password = 'student@123';
      await alexStudent.save();
      console.log('✅ Synchronized student user: alex@student / student@123');
    }
  } catch (e) {
    console.warn('[Auto-Seed] Seeder warning:', e.message);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Express Backend API running on port ${PORT}`);
    console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
};

startServer();
