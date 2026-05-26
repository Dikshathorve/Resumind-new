// Auth Middleware
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log(`[Auth Middleware] ✅ Authenticated | User: ${req.session.email} | SessionID: ${req.sessionID?.substring(0, 10)}...`)
    next()
  } else {
    console.error('[Auth Middleware] ❌ Authentication failed')
    console.error(`  - Session exists: ${!!req.session}`)
    console.error(`  - UserId in session: ${req.session?.userId ? 'YES' : 'NO'}`)
    console.error(`  - Session ID: ${req.sessionID || 'NONE'}`)
    console.error(`  - Request headers (cookie):`, req.headers.cookie || 'NO COOKIES')
    res.status(401).json({
      success: false,
      message: 'Not authenticated. Please login first.',
    })
  }
}

// Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    path: req.path,
    method: req.method,
  })

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  })
}

// 404 Handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  })
}

// Async Handler Wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default {
  isAuthenticated,
  errorHandler,
  notFoundHandler,
  asyncHandler,
}
