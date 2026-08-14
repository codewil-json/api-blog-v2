const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

const postsRoutes = require('./routes/posts');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security
app.use(helmet());

// CORS
app.use(cors());

// JSON parser
app.use(express.json({ limit: '1mb' }));

// URL encoded parser
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    api: 'CodeWil Blog API',
    version: '1.0.0',
    status: 'operational',
    message: 'Welcome to the CodeWil Blog API.',
    documentation: '/docs',
    resources: {
      posts: '/posts'
    }
  });
});

app.get('/docs', (req, res) => {
  res.status(200).json({
    name: 'CodeWil Blog API',
    version: '1.0.0',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Checks the API and database status.'
      },
      login: {
        method: 'POST',
        path: '/login',
        description: 'Authenticates the admin using ADMIN_EMAIL and ADMIN_PASSWORD from the environment.',
        body: ['email', 'password']
      },
      posts: [
        {
          method: 'GET',
          path: '/posts',
          description: 'Lists all posts.'
        },
        {
          method: 'GET',
          path: '/posts/:slug',
          description: 'Returns one post by slug.'
        },
        {
          method: 'POST',
          path: '/posts',
          description: 'Creates a post.',
          body: [
            'slug',
            'title',
            'description',
            'category',
            'date',
            'readTime',
            'tags',
            'content'
          ]
        },
        {
          method: 'PUT',
          path: '/posts/:slug',
          description: 'Updates a post by slug.'
        },
        {
          method: 'DELETE',
          path: '/posts/:slug',
          description: 'Deletes a post by slug.'
        }
      ]
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({
      error: 'Admin credentials are not configured in the environment.'
    });
  }

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required.'
    });
  }

  if (
    String(email).trim().toLowerCase() !== adminEmail ||
    String(password) !== adminPassword
  ) {
    return res.status(401).json({
      error: 'Invalid credentials.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    user: {
      email: adminEmail
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  const databaseStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  const statusCode = databaseStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    status: statusCode === 200 ? 'healthy' : 'unhealthy',
    database: databaseStatus
  });
});

// API routes
app.use('/posts', postsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// MongoDB connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  await mongoose.connection.close();

  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();