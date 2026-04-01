import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'
import User from '../models/users.model.js'

dotenv.config({ path: './.env' })

async function runCleanup() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required in backend/.env')
  }

  await mongoose.connect(`${mongoUri}/${DB_NAME}`)

  const result = await User.updateMany(
    {},
    {
      $unset: {
        password: 1,
        refreshToken: 1,
      },
      $set: {
        isActive: false,
      },
    },
  )

  console.log(`Legacy auth cleanup complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`)
}

runCleanup()
  .catch((error) => {
    console.error('Cleanup failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
