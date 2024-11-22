import { XummSdk } from 'xumm-sdk'

if (!process.env.NEXT_PUBLIC_XUMM_API_KEY) {
  throw new Error('XUMM API Key not found')
}

export const xummSDK = new XummSdk(process.env.NEXT_PUBLIC_XUMM_API_KEY) 