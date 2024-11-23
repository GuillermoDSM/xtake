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

    const { amount, lockupPeriod } = await request.json()
    
    // Conectar al cliente XRPL (testnet)
    const client = new Client('wss://s.altnet.rippletest.net:51233')
    await client.connect()
    
    try {
      // Convertir el monto a drops (1 XRP = 1,000,000 drops)
      const amountInDrops = String(Math.floor(amount * 1000000))
      
      // Calcular el finish_after (tiempo actual + periodo de bloqueo en segundos)
      const finishAfter = Math.floor(Date.now() / 1000) + (lockupPeriod * 24 * 60 * 60)

      // Crear el payload de la transacción
      const txPayload = {
        TransactionType: 'EscrowCreate',
        Account: userToken.value,
        Destination: userToken.value,
        Amount: amountInDrops,
        FinishAfter: finishAfter,
        Fee: '12'
      }

      // Crear la solicitud en XUMM
      const request = await xumm.payload.create({
        txjson: txPayload,
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
    console.error('Escrow creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create escrow' },
      { status: 500 }
    )
  }
} 