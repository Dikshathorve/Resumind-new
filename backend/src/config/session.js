import session from 'express-session'
import MongoStore from 'connect-mongo'
import { config } from './config.js'

export const sessionConfig = session({
  secret: config.sessionSecret,
  resave: true, // Always resave to refresh session TTL and ensure cookie is set
  saveUninitialized: true, // Save session even if empty (needed for first visit)
  store: new MongoStore({
    mongoUrl: config.mongodbUri,
    touchAfter: 24 * 3600, // lazy session update (in seconds)
  }),
  cookie: {
    secure: true, // Force secure cookies (HTTPS) in production
    httpOnly: true, // prevent client-side JS from accessing the cookie
    maxAge: config.sessionMaxAge, // 7 days
    sameSite: 'none', // allow cross-site cookies (REQUIRED for Vercel frontend to Render backend)
    path: '/', // explicitly set path
  },
  name: 'resumind.sid', // custom session cookie name
  proxy: true, // trust proxy (required for Render.com and other cloud platforms)
})

export default sessionConfig
