import nodemailer from 'nodemailer'
import { ApiError } from '../utils/ApiError.js'

// Configure mail transporter
const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.MAIL_PASSWORD,
  },
})

// Store OTPs in memory (in production, use Redis or database)
const otpStorage = new Map()

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Campus Eats - Your OTP for Two-Factor Authentication',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Campus Eats</h1>
            <p style="margin: 5px 0 0 0;">Two-Factor Authentication</p>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5;">
            <p style="font-size: 14px; color: #333;">Hi,</p>
            <p style="font-size: 14px; color: #333;">Your OTP for Campus Eats login is:</p>
            <div style="background-color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #667eea; letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p style="font-size: 12px; color: #999;">This OTP will expire in 5 minutes.</p>
            <p style="font-size: 12px; color: #999;">If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">&copy; 2025 Campus Eats. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new ApiError(500, 'Failed to send OTP email')
  }
}

// Store OTP with expiration
export const storeOTP = async (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
  otpStorage.set(email, { otp, expiresAt })
}

// Verify OTP
export const verifyStoredOTP = async (email, otp) => {
  const storedData = otpStorage.get(email)

  if (!storedData) {
    throw new ApiError(400, 'OTP not found or expired')
  }

  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(email)
    throw new ApiError(400, 'OTP has expired')
  }

  if (storedData.otp !== otp) {
    throw new ApiError(400, 'Invalid OTP')
  }

  // OTP verified, remove it
  otpStorage.delete(email)
  return true
}

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email)
    }
  }
}, 60000) // Cleanup every minute
