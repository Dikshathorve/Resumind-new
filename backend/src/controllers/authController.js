import { User } from '../models/User.js'
import { Projects } from '../models/Projects.js'
import { asyncHandler } from '../middleware/middleware.js'
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/emailService.js'

/**
 * AUTHENTICATION SYSTEM DOCUMENTATION
 * 
 * Technology Stack:
 * - Password Hashing: bcryptjs (automatic hashing on User model pre-save)
 * - Session Management: express-session with MongoDB store
 * - Session Cookie: secure, httpOnly, sameSite (strict in development)
 * - CORS: Enabled with credentials for cookie sharing
 * 
 * Authentication Flow:
 * 1. SIGNUP:
 *    - User provides: fullName, email, password, confirmPassword
 *    - Backend: Validates inputs, checks if email exists
 *    - bcryptjs: Automatically hashes password in User model pre-save hook
 *    - Database: Saves user with hashed password
 *    - Session: Creates session with userId
 *    - Returns: User object with userId and projectsId
 * 
 * 2. SIGNIN:
 *    - User provides: email, password
 *    - Database: Finds user by email
 *    - bcryptjs: Compares provided password with hashed password
 *    - Session: Creates session with userId
 *    - Returns: User object with all data and projectsId
 * 
 * 3. SESSION VERIFICATION:
 *    - Frontend: Can call /api/auth/verify to check if user is logged in
 *    - Backend: Returns user data if session exists
 * 
 * 4. LOGOUT:
 *    - Backend: Destroys session and clears cookie
 *    - Frontend: Clears localStorage
 * 
 * Protected Routes:
 * - Use isAuthenticated middleware on routes that require login
 * - Example: router.get('/route', isAuthenticated, controller)
 * 
 * Session Storage:
 * - MongoDB: Sessions are stored in 'sessions' collection
 * - Auto cleanup: 24 hour touch interval (lazy session update)
 * - Cookie: Expires in 7 days (SESSION_MAX_AGE)
 */

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body

  // Validation
  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    })
  }

  // Check if user already exists and is verified
  let user = await User.findOne({ email })
  
  if (user && user.isEmailVerified) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
    })
  }

  // If user exists but not verified, update the user (from OTP flow)
  if (user) {
    user.fullName = fullName
    user.password = password
    user.isEmailVerified = true
    await user.save()
  } else {
    // Create new user if doesn't exist
    user = await User.create({
      fullName,
      email,
      password,
      isEmailVerified: true, // Mark as verified since OTP has been verified
    })
  }

  // Initialize Projects document with empty projects array and count 0
  const projects = await Projects.create({
    projectsId: user.projectsId,
    userId: user._id,
    projectsCount: 0,
    projects: [],
  })

  // Set session
  req.session.userId = user._id
  req.session.email = user.email
  req.session.name = user.fullName

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user._id,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      projectsId: user.projectsId,
    },
  })
})

// @route   POST /api/auth/signin
// @desc    Login user
// @access  Public
export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    })
  }

  // Find user and select password
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  // Set session
  req.session.userId = user._id
  req.session.email = user.email
  req.session.name = user.fullName

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    user: {
      id: user._id,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      projectsId: user.projectsId,
      subscription: user.subscription,
    },
  })
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out',
      })
    }

    res.clearCookie('resumind.sid')
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  })
})

// @route   GET /api/auth/verify
// @desc    Verify user session - PUBLIC ENDPOINT
// @access  Public
export const verifySession = asyncHandler(async (req, res) => {
  // Check if session exists
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'No active session',
    })
  }

  const user = await User.findById(req.session.userId)
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    })
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      projectsId: user.projectsId,
      subscription: user.subscription,
      profileImage: user.profileImage,
      accentColor: user.preferences?.accentColor,
    },
  })
})

// @route   POST /api/auth/send-otp
// @desc    Send OTP to user's email for verification
// @access  Public
// NOTE: EmailJS sending is now handled on the frontend
export const sendOTP = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body

  // Validation
  if (!email || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'Email and fullName are required',
    })
  }

  // Generate OTP and expiry time
  const otp = generateOTP()
  const otpExpiry = getOTPExpiry()

  try {
    // Find user by email and update OTP
    let user = await User.findOne({ email })
    
    if (!user) {
      // If user doesn't exist, create a temporary user record with OTP
      user = new User({
        email,
        fullName,
        otp,
        otpExpiry,
      })
      await user.save()
    } else {
      // Update existing user with new OTP
      user.otp = otp
      user.otpExpiry = otpExpiry
      await user.save()
    }

    // NOTE: Email sending is now handled on the frontend with EmailJS
    // Backend only generates, stores, and validates OTP

    res.status(200).json({
      success: true,
      message: 'OTP generated successfully. Email will be sent from the browser.',
      email: email,
      otp: otp, // Include OTP in response for frontend to send via EmailJS
      expiresIn: '15 minutes',
    })
  } catch (error) {
    console.error('Error generating OTP:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate OTP',
    })
  }
})

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP sent to user's email
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  // Validation
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
    })
  }

  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+otp +otpExpiry')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.',
      })
    }

    // Check if OTP has expired
    if (isOTPExpired(user.otpExpiry)) {
      user.otp = null
      user.otpExpiry = null
      await user.save()
      
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      })
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
      })
    }

    // OTP verified successfully - only clear OTP, don't mark email as verified yet
    // isEmailVerified will be set during signup endpoint
    user.otp = null
    user.otpExpiry = null
    await user.save()

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Please complete signup.',
      otpVerified: true,
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    })
  }
})

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user's email
// @access  Public
// NOTE: EmailJS sending is now handled on the frontend
export const resendOTP = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body

  // Validation
  if (!email || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'Email and fullName are required',
    })
  }

  try {
    // Find user by email
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if user already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = getOTPExpiry()

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // NOTE: Email sending is now handled on the frontend with EmailJS
    // Backend only generates, stores, and validates OTP

    res.status(200).json({
      success: true,
      message: 'OTP regenerated successfully. Email will be sent from the browser.',
      email: email,
      otp: otp, // Include OTP in response for frontend to send via EmailJS
      expiresIn: '15 minutes',
    })
  } catch (error) {
    console.error('Error resending OTP:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP',
    })
  }
})

export default {
  signup,
  signin,
  logout,
  verifySession,
  sendOTP,
  verifyOTP,
  resendOTP,
}
