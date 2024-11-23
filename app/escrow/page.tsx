"use client"

import { useState } from "react"
import { ArrowLeft, Check } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ProgressSteps } from "@/components/ui/progress-steps"
import { Badge } from "@/components/ui/badge"
import { CosmosLogo, EthereumLogo, PolkadotLogo } from "@/components/network-logos"

interface Network {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  apy: string
  isAvailable: boolean
}

export default function EscrowPage() {
  const [amount, setAmount] = useState(1000)
  const [selectedNetwork, setSelectedNetwork] = useState("cosmos")
  const [isDeploying, setIsDeploying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const networks: Network[] = [
    { id: "cosmos", name: "Cosmos (ATOM)", icon: CosmosLogo, apy: "19.95%", isAvailable: true },
    { id: "ethereum", name: "Ethereum (ETH)", icon: EthereumLogo, apy: "5.20%", isAvailable: false },
    { id: "polkadot", name: "Polkadot (DOT)", icon: PolkadotLogo, apy: "10.50%", isAvailable: false },
  ]

  const steps = [
    { 
      label: "Creating XRP Escrow", 
      status: currentStep >= 0 ? "completed" as const : "pending" as const 
    },
    { 
      label: "Confirming Transaction", 
      status: currentStep >= 1 ? "completed" as const : "pending" as const 
    },
    { 
      label: "Finalizing Setup", 
      status: currentStep >= 2 ? "completed" as const : "pending" as const 
    },
  ]

  const handleDeploy = async () => {
    try {
      setIsDeploying(true)
      setCurrentStep(0)

      // Crear el escrow
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          lockupPeriod: 90 // 3 meses en días
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Abrir XUMM para firmar
      const popup = window.open(
        data.url,
        'xumm-escrow',
        'width=600,height=700,left=200,top=100'
      )

      if (!popup) {
        throw new Error('Popup blocked')
      }

      // Monitorear el estado de la firma
      const socket = new WebSocket(data.socket)
      
      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data)
        
        if (message.signed) {
          setCurrentStep(1)
          // Aquí iría la lógica para desplegar el nodo validador
          setTimeout(() => {
            setCurrentStep(2)
            setTimeout(() => {
              socket.close()
              if (popup) popup.close()
              setIsDeploying(false)
            }, 2000)
          }, 2000)
        } else if (message.rejected) {
          throw new Error('Transaction rejected')
        }
      }

      socket.onerror = () => {
        throw new Error('WebSocket error')
      }

    } catch (error) {
      console.error('Deployment failed:', error)
      setIsDeploying(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      setAmount(Math.min(Math.max(value, 0), 100000))
    }
  }

  return (
    <div className="min-h-screen p-8">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/" aria-label="Back to Dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Your Staking Process</h1>

        <Card>
          <CardHeader>
            <CardTitle>Configure Escrow</CardTitle>
            <CardDescription>Set up your staking parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount-input">How much XRP would you like to stake?</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[amount]}
                  onValueChange={([value]) => setAmount(value)}
                  max={500}
                  step={10}
                  className="flex-1"
                  aria-label="Stake amount"
                />
                <Input
                  id="amount-input"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-24"
                  min={0}
                  max={100000}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lock Period</Label>
              <p className="text-sm text-muted-foreground">3 months minimum</p>
            </div>
            <div className="space-y-2">
              <Label>Penalty Conditions</Label>
              <p className="text-sm text-muted-foreground">Slashing for inactivity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Network</CardTitle>
            <CardDescription>Choose the network for your staking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {networks.map((network) => (
                <Card
                  key={network.id}
                  className={`relative cursor-pointer transition-all ${
                    network.isAvailable
                      ? "hover:border-primary"
                      : "opacity-50 cursor-not-allowed"
                  } ${selectedNetwork === network.id ? "border-primary" : ""}`}
                  onClick={() => network.isAvailable && setSelectedNetwork(network.id)}
                >
                  <CardContent className="flex flex-col items-center p-6">
                    <network.icon className="h-12 w-12 mb-2" />
                    <h3 className="font-semibold text-center">{network.name}</h3>
                    <p className="text-2xl font-bold mt-2">{network.apy} APY</p>
                    {!network.isAvailable && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        Soon
                      </Badge>
                    )}
                    {selectedNetwork === network.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Node Status</CardTitle>
            <CardDescription>Current progress of your validator node setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressSteps steps={steps} />
            <Button 
              className="w-full" 
              onClick={handleDeploy}
              disabled={isDeploying || selectedNetwork !== "cosmos"}
            >
              {isDeploying ? "Deploying..." : "Create Escrow & Deploy Node"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

