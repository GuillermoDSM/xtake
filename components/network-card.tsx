import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NetworkCardProps {
  network: string
  apy: string
  isComingSoon?: boolean
  icon: React.ReactNode
}

export function NetworkCard({ network, apy, isComingSoon, icon }: NetworkCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{network}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{apy}</div>
        <Button 
          className="mt-4 w-full" 
          disabled={isComingSoon}
          variant={isComingSoon ? "outline" : "default"}
        >
          {isComingSoon ? "Coming Soon" : "Stake Now"}
        </Button>
      </CardContent>
    </Card>
  )
}

