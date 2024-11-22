
# Guía de Implementación de XUMM en NextJS

## 1. Configuración Inicial
### Instalar la dependencia de XUMM:
```bash
npm install xumm-sdk
```

### Configurar las variables de entorno necesarias:
```plaintext
NEXT_PUBLIC_XUMM_API_KEY=tu_api_key
XUMM_API_SECRET=tu_api_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Crear el SDK Helper
Crear un archivo de utilidad para XUMM:
```typescript
import { XummSdk } from 'xumm-sdk'

if (!process.env.NEXT_PUBLIC_XUMM_API_KEY) {
  throw new Error('XUMM API Key not found')
}

export const xummSDK = new XummSdk(process.env.NEXT_PUBLIC_XUMM_API_KEY)
```

## 3. Implementar el Endpoint de Autenticación
Crear la ruta de API para iniciar el proceso de login:
```typescript
import { XummSdk } from 'xumm-sdk'
import { NextResponse } from 'next/server'

const xumm = new XummSdk(
  process.env.NEXT_PUBLIC_XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
)

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const request = await xumm.payload.create({
      TransactionType: 'SignIn',
      options: {
        return_url: {
          web: `${baseUrl}/api/auth/xumm/callback`,
          app: `${baseUrl}/api/auth/xumm/callback`
        },
        expire: 5,
        force_login: true,
        web_only: true,
        submit: false
      }
    }, false)

    if (!request) {
      throw new Error('Failed to create XUMM request')
    }

    return NextResponse.json({ 
      url: request.next.always,
      payloadId: request.uuid,
      socket: request.refs.websocket_status
    })
  } catch (error) {
    console.error('XUMM request failed:', error)
    return NextResponse.json(
      { error: 'Failed to create XUMM request' },
      { status: 500 }
    )
  }
}
```



## 4. Crear el Componente de Login
Implementar el componente que maneja la interacción con XUMM:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
export function XummLogin() {
  const [isLoading, setIsLoading] = useState(false)

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

      if (!data.socket || typeof data.socket !== 'string') {
        throw new Error('Invalid WebSocket URL')
      }

      const socket = new WebSocket(data.socket)
      
      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.signed || (message.payload && message.payload.meta && message.payload.meta.signed)) {
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
        setIsLoading(false)
      }

      socket.onclose = () => {
        setIsLoading(false)
      }
      
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
    }
  }
  return (
    <Button 
      onClick={handleLogin} 
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect with XUMM'
      )}
    </Button>
  )
}
```

## 5. Implementar el Callback
Crear el endpoint que maneja la respuesta de XUMM:
```typescript
import { XummSdk } from 'xumm-sdk'
import { NextResponse } from 'next/server'

const xumm = new XummSdk(
  process.env.NEXT_PUBLIC_XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const payloadId = searchParams.get('payloadId')

  if (!payloadId) {
    console.error('No payload ID provided')
    return NextResponse.json({ error: 'no_payload' }, { status: 400 })
  }

  try {
    const payload = await xumm.payload.get(payloadId)
    
    if (!payload) {
      console.error('No payload found')
      return NextResponse.json({ error: 'no_payload_found' }, { status: 400 })
    }

    if (payload.meta.signed) {
      const userToken = payload.response.account

      if (!userToken) {
        console.error('No user token found')
        return NextResponse.json({ error: 'no_user_token' }, { status: 400 })
      }

      const response = NextResponse.json({ success: true })
      
      response.cookies.set({
        name: 'auth_token',
        value: userToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      return response
    } else {
      console.error('Payload not signed')
      return NextResponse.json({ error: 'not_signed' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
```



## 6. Gestión del Estado de Autenticación
Crear un contexto para manejar el estado de autenticación:
```typescript
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  address: string
  name?: string
  level: number
  xp: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        
        if (data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## 7. Implementar Middleware de Protección
Crear un middleware para proteger las rutas:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth_token')
  const isAuthPage = request.nextUrl.pathname === '/login'

  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/'
  ]
}
```

## Puntos Clave a Recordar:
### Flujo de Autenticación:
1. Usuario hace clic en "Connect with XUMM".
2. Se genera una solicitud de firma en XUMM.
3. Se abre una ventana popup con el QR.
4. El usuario firma con la app XUMM.
5. El callback procesa la respuesta y establece la cookie de autenticación.

### Seguridad:
- Usar variables de entorno para las claves.
- Implementar httpOnly cookies para el token.
- Validar las respuestas de XUMM en el servidor.

### UX:
- Mostrar estados de carga apropiados.
- Manejar errores gracefully.
- Proporcionar feedback visual del estado de conexión.

## Estructura de Archivos:
```bash
/app
  /api
    /auth
      /xumm
        route.ts
        callback/route.ts
/components
  XummLogin.tsx
/contexts
  AuthContext.tsx
/lib
  xumm.ts
middleware.ts
```

Este resumen te servirá como guía para implementar XUMM en futuros proyectos NextJS. La implementación específica puede variar según los requisitos del proyecto, pero la estructura básica y el flujo permanecen similares.


