import { XummSdk } from 'xumm-sdk'
import { NextResponse } from 'next/server'

const xumm = new XummSdk(
  process.env.NEXT_PUBLIC_XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
)

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const request = await xumm.payload.create({
      TransactionType: 'SignIn',
      options: {
        return_url: {
          web: `${baseUrl}/api/auth/xumm/callback`,
          app: `${baseUrl}/api/auth/xumm/callback`
        },
        expire: 5,
        force_login: true,
        web_only: true,
        submit: false
      }
    }, false)

    if (!request) {
      throw new Error('Failed to create XUMM request')
    }

    return NextResponse.json({ 
      url: request.next.always,
      payloadId: request.uuid,
      socket: request.refs.websocket_status
    })
  } catch (error) {
    console.error('XUMM request failed:', error)
    return NextResponse.json(
      { error: 'Failed to create XUMM request' },
      { status: 500 }
    )
  }
} 