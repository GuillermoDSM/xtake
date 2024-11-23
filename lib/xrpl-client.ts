import { Client } from 'xrpl'

// Testnet por defecto para desarrollo
const XRPL_NODE = process.env.XRPL_NODE || 'wss://s.altnet.rippletest.net:51233'

let client: Client | null = null

export async function getXrplClient() {
  if (!client) {
    client = new Client(XRPL_NODE)
    await client.connect()
  }
  return client
}

export async function disconnectXrplClient() {
  if (client) {
    await client.disconnect()
    client = null
  }
} 