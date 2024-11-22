"use client"

import { useState } from "react"
import { ArrowLeft, Atom, Coins, EclipseIcon as Ethereum, Check } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ProgressSteps } from "@/components/ui/progress-steps"
import { Badge } from "@/components/ui/badge"
import { CosmosLogo, EthereumLogo, PolkadotLogo } from "@/components/network-logos"

export default function EscrowPage() {
  const [amount, setAmount] = useState(1000)
  const [selectedNetwork, setSelectedNetwork] = useState("cosmos")
  const [isDeploying, setIsDeploying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const networks = [
    { id: "cosmos", name: "Cosmos (ATOM)", icon: CosmosLogo, apy: "19.95%", isAvailable: true },
    { id: "ethereum", name: "Ethereum (ETH)", icon: EthereumLogo, apy: "5.20%", isAvailable: false },
    { id: "polkadot", name: "Polkadot (DOT)", icon: PolkadotLogo, apy: "10.50%", isAvailable: false },
  ]

  const steps = [
    { label: "Preparing Escrow", status: "pending" as const },
    { label: "Deploying Validator Node", status: "pending" as const },
    { label: "Registering with Network", status: "pending" as const },
  ]

  const handleDeploy = () => {
    setIsDeploying(true)
    // Simulate deployment process
    let step = 0
    const interval = setInterval(() => {
      if (step < 3) {
        setCurrentStep(step)
        steps[step].status = "completed"
        step++
      } else {
        clearInterval(interval)
        setIsDeploying(false)
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen p-8">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Manage Your Staking Process</h1>

        <Card>
          <CardHeader>
            <CardTitle>Configure Escrow</CardTitle>
            <CardDescription>Set up your staking parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>How much XRP would you like to stake?</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[amount]}
                  onValueChange={([value]) => setAmount(value)}
                  max={100000}
                  step={100}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setAmount(Math.min(Math.max(value, 0), 100000))
                    }
                  }}
                  className="w-24"
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

