"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XummLogin } from "@/components/XummLogin"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to XRP Staking</CardTitle>
          <CardDescription>
            Connect your XUMM wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <XummLogin />
          <p className="text-sm text-muted-foreground text-center">
            Make sure you have XUMM (Xaman) wallet installed
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 