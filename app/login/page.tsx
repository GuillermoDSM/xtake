"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XummLogin } from "@/components/XummLogin"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            <Image 
              src="/images/xtakelogo.png"
              alt="XTake Logo" 
              width={200} 
              height={48} 
              className="mx-auto py-12"
              priority
            />
          </CardTitle>
          <CardDescription>
            Connect your XAMAN wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <XummLogin />
        </CardContent>
      </Card>
    </div>
  )
} 