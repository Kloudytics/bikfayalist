import { prisma } from './db'
import crypto from 'crypto'

// Token expiry times
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000 // 1 hour

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  // Delete any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  const token = generateSecureToken()
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  return token
}

export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete any existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { 
      identifier: `password-reset:${email}`
    }
  })

  const token = generateSecureToken()
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY)

  await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token,
      expires
    }
  })

  return token
}

export async function verifyEmailVerificationToken(email: string, token: string): Promise<boolean> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token
        }
      }
    })

    if (!verificationToken) {
      return false
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { 
          identifier_token: {
            identifier: email,
            token
          }
        }
      })
      return false
    }

    // Token is valid, delete it (one-time use)
    await prisma.verificationToken.delete({
      where: { 
        identifier_token: {
          identifier: email,
          token
        }
      }
    })

    return true
  } catch (error) {
    console.error('Error verifying email verification token:', error)
    return false
  }
}

export async function verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `password-reset:${email}`,
          token
        }
      }
    })

    if (!verificationToken) {
      return false
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { 
          identifier_token: {
            identifier: `password-reset:${email}`,
            token
          }
        }
      })
      return false
    }

    // Token is valid, but don't delete it yet (will be deleted after password is reset)
    return true
  } catch (error) {
    console.error('Error verifying password reset token:', error)
    return false
  }
}

export async function deletePasswordResetToken(email: string, token: string): Promise<void> {
  try {
    await prisma.verificationToken.delete({
      where: { 
        identifier_token: {
          identifier: `password-reset:${email}`,
          token
        }
      }
    })
  } catch (error) {
    console.error('Error deleting password reset token:', error)
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    
    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired tokens`)
    }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
  }
}