import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Notification preferences schema
const notificationSchema = z.object({
  emailAlerts: z.boolean().default(true),
  messageNotifications: z.boolean().default(true),
  listingUpdates: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Validate input data
    const validatedData = notificationSchema.parse(body)

    // Check if user has existing preferences
    let userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    })

    if (userPreferences) {
      // Update existing preferences
      userPreferences = await prisma.userPreferences.update({
        where: { userId: session.user.id },
        data: {
          emailAlerts: validatedData.emailAlerts,
          messageNotifications: validatedData.messageNotifications,
          listingUpdates: validatedData.listingUpdates,
          marketingEmails: validatedData.marketingEmails,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new preferences
      userPreferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          emailAlerts: validatedData.emailAlerts,
          messageNotifications: validatedData.messageNotifications,
          listingUpdates: validatedData.listingUpdates,
          marketingEmails: validatedData.marketingEmails,
        },
      })
    }

    return NextResponse.json({ 
      message: 'Notification preferences updated successfully',
      preferences: userPreferences
    })
  } catch (error) {
    console.error('Failed to update notification preferences:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    })

    // Return default preferences if none exist
    const preferences = userPreferences || {
      emailAlerts: true,
      messageNotifications: true,
      listingUpdates: false,
      marketingEmails: false,
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}