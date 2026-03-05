import compression from 'compression'
import cors from 'cors'
import express, { Request, Response } from 'express'
import path from 'path'

import Routers from './_workspace/Routes'
import { loadEnvironmentVariables } from './config/env'

import { errorHandler } from './middlewares/errorHandler'
import { notFoundHandler } from './middlewares/notFoundHandler'
import { startPronesSyncScheduler } from './cron/pronesSync'

// * Load environment variables
loadEnvironmentVariables()

// * Create express app
const app = express()
const PORT = process.env.PORT || 3000
const prefix = `/api/${process.env.APPLICATION_URL || ''}`

// * Middleware

app.use(compression())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(cors())

// * Routes
app.get('/', (req: Request, res: Response) => {
  res.send(`
🐱 Server is running
  - URL               : http://localhost:${PORT}${prefix}
  - Environment       : ${process.env.NODE_ENV}
  - Port              : ${PORT}
  - Last Update       : 2025-Mar-25 18:31
  `)
})

app.get(prefix, (req: Request, res: Response) => {
  res.send(`
🐱 Server is running
  - URL               : http://localhost:${PORT}${prefix}
  - Environment       : ${process.env.NODE_ENV}
  - Port              : ${PORT}
  - Last Update       : 2025-Mar-25 18:31
  `)
})

// * Static Files
// Serve uploaded documents at: GET /uploads/documents/<filename>
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use(prefix, Routers)

// * Error Handling
// 404 handler
app.all(/.*/, notFoundHandler)
// 500 handler
app.use(errorHandler)

// * Start server
app.listen(PORT, () => {
  console.log(`
🐱 Server is running
  - URL               : http://localhost:${PORT}${prefix}
  - Environment       : ${process.env.NODE_ENV}
  - Port              : ${PORT}
  - DB                : ${process.env.DB}
  - DB SCT            : ${process.env.STANDARD_COST_DB}
  - DB Cycle Time     : ${process.env.CYCLE_TIME_DB}
  `)

  // Start Prones auto-sync (every 24 hours)
  startPronesSyncScheduler()
})
