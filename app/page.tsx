"use client"

import { useEffect, useState } from 'react'
import { Coins, Server } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/overview"
import { XummLogin } from '@/components/XummLogin'

interface EscrowObject {
  Amount: string
  Account: string
  Destination: string
  FinishAfter: number
  Sequence: number
}

export default function DashboardPage() {
  const [lockedAmount, setLockedAmount] = useState<number>(0)
  const [escrows, setEscrows] = useState<EscrowObject[]>([])
  const [isUnlocking, setIsUnlocking] = useState(false)

  useEffect(() => {
    fetchEscrowData()
  }, [])

  const fetchEscrowData = async () => {
    const response = await fetch('/api/escrow/fetch')
    const data = await response.json()
    console.log('Fetched escrow data:', data)
    if (data.totalLocked) {
      setLockedAmount(data.totalLocked)
      setEscrows(data.escrows)
    }
  }

  const handleUnlock = async (owner: string, seq: number) => {
    try {
      setIsUnlocking(true)
      console.log('Attempting to unlock escrow:', { owner, seq })
      
      const response = await fetch('/api/escrow/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, seq }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unlock escrow')
      }

      const data = await response.json()
      console.log('Unlock response:', data)

      const popup = window.open(data.url, 'xumm-finish', 'width=600,height=700')
      
      if (!popup) {
        throw new Error('Popup blocked')
      }

      const socket = new WebSocket(data.socket)
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        console.log('WebSocket message:', message)
        
        if (message.signed) {
          socket.close()
          if (popup) popup.close()
          fetchEscrowData() // Refresh data after successful unlock
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsUnlocking(false)
      }

      socket.onclose = () => {
        setIsUnlocking(false)
      }

    } catch (error) {
      console.error('Unlock failed:', error)
      setIsUnlocking(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Button 
              asChild 
              className="bg-[#adfa1d] hover:bg-[#adfa1d]/90 text-black"
            >
              <Link href="/escrow">Escrow & Staking</Link>
            </Button>
            <XummLogin />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Staking Overview</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locked</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lockedAmount.toFixed(2)} XRP</div>
              {escrows.length > 0 && (
                <Button
                  onClick={() => handleUnlock(escrows[0].Account, escrows[0].Sequence)}
                  disabled={isUnlocking}
                  className="mt-4"
                  variant="destructive"
                >
                  {isUnlocking ? "Unlocking..." : "Unlock Funds"}
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validator Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPU Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-primary rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Memory</span>
                    <span>5.2GB / 8GB</span>
                  </div>
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-primary rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage</span>
                    <span>156GB / 250GB</span>
                  </div>
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[62%] bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground">
                <p>Ubuntu 20.04 LTS • Cosmos Node v0.47.3</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Overview />
      </div>
    </div>
  )
}

