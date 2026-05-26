import express from 'express'
import {
  signup,
  signin,
  logout,
  verifySession,
  sendOTP,
  verifyOTP,
  resendOTP,
} from '../controllers/authController.js'
import { isAuthenticated } from '../middleware/middleware.js'
import { config } from '../config/config.js'

const router = express.Router()

// Debug endpoint - check EmailJS configuration
router.get('/debug/config', (req, res) => {
  res.json({
    emailJs: {
      serviceId: config.emailJsServiceId || 'NOT SET',
      publicKey: config.emailJsPublicKey ? '✓ SET' : 'NOT SET',
      templateId: config.emailJsTemplateId || 'NOT SET',
      userId: config.emailJsUserId ? '✓ SET' : 'NOT SET',
    },
    isConfigured: !!(config.emailJsServiceId && config.emailJsPublicKey && config.emailJsTemplateId),
  })
})

// Public routes
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp', resendOTP)
router.get('/verify', verifySession) // Public - used by frontend to check if session exists on app load

// Protected routes (require authentication)
router.post('/logout', isAuthenticated, logout)

export default router
