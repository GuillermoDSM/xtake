import { Client } from 'xrpl'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface EscrowObject {
  Amount: string
  Account: string
  Destination: string
  FinishAfter: number
  Sequence: number
}

export async function GET() {
  const cookieStore = cookies()
  const userToken = cookieStore.get('auth_token')

  if (!userToken) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    )
  }

  const client = new Client('wss://s.altnet.rippletest.net:51233')
  
  try {
    await client.connect()
    
    const response = await client.request({
      command: 'account_objects',
      account: userToken.value,
      type: 'escrow'
    })

    console.log('Escrow objects:', response.result.account_objects)

    const escrows: EscrowObject[] = response.result.account_objects || []
    const totalLocked = escrows.reduce((sum: number, escrow: EscrowObject) => 
      sum + Number(escrow.Amount), 0) / 1000000 // Convert from drops to XRP

    return NextResponse.json({ 
      totalLocked,
      escrows 
    })

  } catch (error) {
    console.error('Failed to fetch escrows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch escrow data' },
      { status: 500 }
    )
  } finally {
    await client.disconnect()
  }
} 