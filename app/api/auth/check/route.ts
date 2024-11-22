import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const authToken = cookieStore.get('auth_token')

  if (!authToken) {
    return NextResponse.json({ 
      authenticated: false 
    })
  }

  return NextResponse.json({ 
    authenticated: true,
    address: authToken.value
  })
} 