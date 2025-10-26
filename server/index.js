require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');
const sessionRoutes = require('./routes/sessions');

const app = express();
const server = http.createServer(app);

// middleware
app.use(cors({
  origin: "*",
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/sessions', sessionRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 8000;
const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
