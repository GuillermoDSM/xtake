import { XummSdk } from 'xumm-sdk'
import { Client } from 'xrpl'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const xumm = new XummSdk(
  process.env.NEXT_PUBLIC_XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
)

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const userToken = cookieStore.get('auth_token')

    if (!userToken) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { owner, seq } = await request.json()

    // Connect to XRPL client
    const client = new Client('wss://s.altnet.rippletest.net:51233')
    await client.connect()

    try {
      // Create XUMM request for EscrowFinish
      const request = await xumm.payload.create({
        TransactionType: 'EscrowFinish',
        Account: userToken.value,
        Owner: owner,
        OfferSequence: parseInt(seq),
        Fee: '12',
        options: {
          expire: 5,
          submit: true
        }
      })

      if (!request) {
        throw new Error('Failed to create XUMM request')
      }

      return NextResponse.json({ 
        url: request.next.always,
        payloadId: request.uuid,
        socket: request.refs.websocket_status
      })

    } finally {
      await client.disconnect()
    }

  } catch (error) {
    console.error('Escrow finish failed:', error)
    return NextResponse.json(
      { error: 'Failed to create finish request' },
      { status: 500 }
    )
  }
} 