'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function XummLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, logout, userAddress } = useAuth()

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/xumm', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const popup = window.open(
        data.url,
        'xumm-login',
        'width=500,height=700,left=200,top=100'
      )

      if (!popup) {
        throw new Error('Popup blocked')
      }

      const popupCheckInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval)
          setIsLoading(false)
          socket.close()
        }
      }, 1000)

      if (!data.socket || typeof data.socket !== 'string') {
        throw new Error('Invalid WebSocket URL')
      }

      const socket = new WebSocket(data.socket)
      
      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.signed || (message.payload && message.payload.meta && message.payload.meta.signed)) {
            clearInterval(popupCheckInterval)
            const callbackResponse = await fetch(`/api/auth/xumm/callback?payloadId=${data.payloadId}`)
            const callbackData = await callbackResponse.json()
            
            if (callbackResponse.ok && callbackData.success) {
              socket.close()
              if (popup) popup.close()
              window.location.href = '/'
            } else {
              throw new Error(callbackData.error || 'Callback failed')
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
          setIsLoading(false)
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        clearInterval(popupCheckInterval)
        setIsLoading(false)
      }

      socket.onclose = () => {
        clearInterval(popupCheckInterval)
        setIsLoading(false)
      }
      
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <Button 
        onClick={logout}
        variant="outline"
        className="flex items-center gap-2"
      >
        <span className="hidden sm:inline">
          {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
        </span>
        <LogOut className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleLogin} 
      disabled={isLoading}
      className="flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span>Connect with XAMAN</span>
        </>
      )}
    </Button>
  )
} 