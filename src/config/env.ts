// src/config/env.ts
import dotenv from 'dotenv'
import fs from 'fs'

export const loadEnvironmentVariables = () => {
  dotenv.config({ path: './.env' })

  const envFile = (() => {
    switch (process.env.NODE_ENV) {
      case 'development':
        return './.env.development'
      case 'sit':
        return './.env.sit'
      case 'uat':
        return './.env.uat'
      case 'production':
        return './.env.production'
      case 'azure':
        return './.env.azure'
      default:
        throw new Error('NODE_ENV not found !!!')
    }
  })()

  if (!fs.existsSync(envFile)) {
    throw new Error(`.env file not found at: ${envFile}`)
  }

  // Bun preloads .env.development for NODE_ENV values it does not know (sit/uat), and dotenv
  // never overwrites existing vars, so sit/uat must override those preloaded values.
  const override = process.env.NODE_ENV === 'sit' || process.env.NODE_ENV === 'uat'

  dotenv.config({ path: envFile, override })
}
