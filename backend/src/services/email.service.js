import { Resend } from 'resend'
import { ApiError } from '../utils/ApiError.js'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send welcome email to newly registered user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} userRole - User's role (customer, shopkeeper, delivery)
 * @returns {Promise<Object>} Email sending response
 */
export const sendWelcomeEmail = async (userEmail, userName, userRole) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new ApiError(500, 'Email service not configured')
    }

    const roleGreeting = {
      customer: 'Ready to satisfy your cravings?',
      shopkeeper: 'Welcome to the CampusEats Seller Platform!',
      delivery: 'Welcome to the CampusEats Delivery Network!',
    }

    const roleMessage = {
      customer:
        'Browse delicious food from your favorite campus restaurants and get delivered to your doorstep.',
      shopkeeper:
        'Start selling your food items and reach more customers on campus. Manage your menu and orders effortlessly.',
      delivery:
        'Join our delivery network and start earning by delivering food orders across campus.',
    }

    const roleActionUrl = {
      customer: `${process.env.FRONTEND_URL}/shops`,
      shopkeeper: `${process.env.FRONTEND_URL}/shop-dashboard`,
      delivery: `${process.env.FRONTEND_URL}/delivery-dashboard`,
    }

    const response = await resend.emails.send({
      from: 'CampusEats <onboarding@resend.dev>',
      to: userEmail,
      subject: '🎉 Welcome to CampusEats!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .content {
                padding: 40px 20px;
              }
              .greeting {
                font-size: 22px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 15px;
              }
              .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 25px;
                line-height: 1.8;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 10px;
                transition: transform 0.2s;
              }
              .cta-button:hover {
                transform: translateY(-2px);
              }
              .features {
                background-color: #fff;
                padding: 20px;
                border-radius: 6px;
                margin-top: 25px;
                border-left: 4px solid #667eea;
              }
              .features h3 {
                color: #1f2937;
                margin-top: 0;
              }
              .features ul {
                margin: 10px 0;
                padding-left: 20px;
                color: #4b5563;
              }
              .features li {
                margin-bottom: 8px;
              }
              .footer {
                background-color: #f3f4f6;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
              }
              .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 25px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍕 CampusEats</h1>
                <p style="margin: 5px 0; font-size: 14px;">Food Delivery on Campus</p>
              </div>

              <div class="content">
                <div class="greeting">Hi ${userName}! 👋</div>
                
                <div class="message">
                  ${roleGreeting[userRole] || 'Welcome to CampusEats!'}
                </div>

                <div class="message">
                  ${roleMessage[userRole] || 'Thank you for joining our community!'}
                </div>

                <div style="text-align: center;">
                  <a href="${roleActionUrl[userRole]}" class="cta-button">
                    Get Started Now
                  </a>
                </div>

                <div class="divider"></div>

                <div class="features">
                  <h3>✨ What You Can Do:</h3>
                  <ul>
                    ${
                      userRole === 'customer'
                        ? `
                        <li>Browse restaurants and food items</li>
                        <li>Track real-time delivery status</li>
                        <li>Save your favorite restaurants</li>
                        <li>Earn rewards on every order</li>
                      `
                        : userRole === 'shopkeeper'
                          ? `
                        <li>Add and manage your food items</li>
                        <li>Accept and manage orders</li>
                        <li>Track earnings and sales</li>
                        <li>Reach students across campus</li>
                      `
                          : `
                        <li>View available delivery orders</li>
                        <li>Earn money with flexible hours</li>
                        <li>Build your delivery rating</li>
                        <li>Get real-time updates</li>
                      `
                    }
                  </ul>
                </div>

                <div class="divider"></div>

                <div class="message" style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                  Your account is now active and ready to use. If you have any questions, feel free to reach out to our support team.
                </div>
              </div>

              <div class="footer">
                <p>© 2026 CampusEats. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly to this address.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (response.error) {
      throw new ApiError(500, `Failed to send welcome email: ${response.error.message}`)
    }

    return response
  } catch (error) {
    console.error('Email sending error:', error)
    // Don't throw error - email failure shouldn't block user registration
    console.warn('Welcome email could not be sent, but user registration succeeded')
  }
}

/**
 * Send password reset email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} resetLink - Password reset link
 * @returns {Promise<Object>} Email sending response
 */
export const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
    const response = await resend.emails.send({
      from: 'CampusEats <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Reset Your CampusEats Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
              .content { padding: 40px 20px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; }
              .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset</h1>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                <p>We received a request to reset your CampusEats password. Click the button below to create a new password.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" class="cta-button">Reset Password</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
              </div>
              <div class="footer">
                <p>© 2026 CampusEats. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (response.error) {
      throw new ApiError(500, `Failed to send password reset email: ${response.error.message}`)
    }

    return response
  } catch (error) {
    console.error('Password reset email error:', error)
    throw error
  }
}
