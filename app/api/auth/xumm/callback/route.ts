import { XummSdk } from 'xumm-sdk'
import { NextResponse } from 'next/server'

const xumm = new XummSdk(
  process.env.NEXT_PUBLIC_XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const payloadId = searchParams.get('payloadId')

  if (!payloadId) {
    console.error('No payload ID provided')
    return NextResponse.json({ error: 'no_payload' }, { status: 400 })
  }

  try {
    const payload = await xumm.payload.get(payloadId)
    
    if (!payload) {
      console.error('No payload found')
      return NextResponse.json({ error: 'no_payload_found' }, { status: 400 })
    }

    if (payload.meta.signed) {
      const userToken = payload.response.account

      if (!userToken) {
        console.error('No user token found')
        return NextResponse.json({ error: 'no_user_token' }, { status: 400 })
      }

      const response = NextResponse.json({ success: true })
      
      response.cookies.set({
        name: 'auth_token',
        value: userToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      return response
    } else {
      console.error('Payload not signed')
      return NextResponse.json({ error: 'not_signed' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
} 