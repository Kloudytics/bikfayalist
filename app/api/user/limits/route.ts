import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBusinessRulesSummary } from '@/lib/business-rules'
import { getSecurityHeaders } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: getSecurityHeaders() }
      )
    }

    const summary = await getBusinessRulesSummary(session.user.id)

    return NextResponse.json(summary, {
      headers: getSecurityHeaders()
    })

  } catch (error) {
    console.error('Failed to fetch user limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user limits' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}