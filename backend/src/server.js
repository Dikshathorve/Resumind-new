import express from 'express'
import cors from 'cors'
import { config } from './config/config.js'
import { connectDB } from './config/database.js'
import sessionConfig from './config/session.js'
import { errorHandler, notFoundHandler } from './middleware/middleware.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import userRoutes from './routes/userRoutes.js'
import analysisRoutes from './routes/analysisRoutes.js'
import aiSuggestionsRoutes from './routes/aiSuggestionsRoutes.js'
import summaryAIRoutes from './routes/summaryAIRoutes.js'
import experienceAIRoutes from './routes/experienceAIRoutes.js'
import atsRoutes from './routes/atsRoutes.js'

const app = express()

// Connect to database (non-blocking - don't wait for connection)
connectDB().catch(err => {
  console.error('Database connection will be retried...')
})

// Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// CORS configuration - supports multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from localhost on any port in development
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true)
    } else if (process.env.CORS_ORIGIN) {
      // In production, check against CORS_ORIGIN env variable
      const allowedOrigins = process.env.CORS_ORIGIN.split(',')
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    } else {
      callback(null, true) // Allow all in development
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Security headers middleware
app.use((req, res, next) => {
  // Add X-Content-Type-Options header to prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Set appropriate cache-control headers for different route types
  if (req.path.startsWith('/api/')) {
    // For API responses: don't cache sensitive data
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  } else {
    // For static assets: allow shorter caching
    res.setHeader('Cache-Control', 'public, max-age=3600')
  }
  
  // Handle Set-Cookie headers (remove unsupported partitioned attribute if present)
  const originalSetHeader = res.setHeader
  res.setHeader = function(name, value) {
    if (name && name.toLowerCase() === 'set-cookie' && typeof value === 'string') {
      // Remove the problematic 'partitioned' attribute
      value = value.replace(/;\s*partitioned/gi, '')
    }
    return originalSetHeader.call(this, name, value)
  }
  
  next()
})

// Session middleware
app.use(sessionConfig)

// Request logging middleware
app.use((req, res, next) => {
  next()
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/user', userRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/ai', aiSuggestionsRoutes)
app.use('/api/ai', summaryAIRoutes)
app.use('/api/ai', experienceAIRoutes)
app.use('/api/ats', atsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

// Start server
const PORT = parseInt(config.port, 10) || 5000
const server = app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════╗
    ║   Resumind Backend Server Started          ║
    ║   Port: ${PORT}                              ║
    ║   Environment: ${config.nodeEnv}            ║
    ║   Database: MongoDB                        ║
    ║   Session: MongoDB Store                   ║
    ╚═══════════════════════════════════════════╝
  `)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using that port or set PORT to a different value.`)
    process.exit(1)
  }

  console.error('Server failed to start:', error)
  process.exit(1)
})

export default app
