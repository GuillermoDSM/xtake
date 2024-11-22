import { cn } from "@/lib/utils"

interface NetworkLogoProps extends React.HTMLAttributes<HTMLImageElement> {
  className?: string
}

export function CosmosLogo({ className, ...props }: NetworkLogoProps) {
  return (
    <img
      src="https://cryptologos.cc/logos/cosmos-atom-logo.svg"
      alt="Cosmos Logo"
      className={cn("h-12 w-12", className)}
      {...props}
    />
  )
}

export function EthereumLogo({ className, ...props }: NetworkLogoProps) {
  return (
    <img
      src="https://cryptologos.cc/logos/ethereum-eth-logo.svg"
      alt="Ethereum Logo"
      className={cn("h-12 w-12", className)}
      {...props}
    />
  )
}

export function PolkadotLogo({ className, ...props }: NetworkLogoProps) {
  return (
    <img
      src="https://cryptologos.cc/logos/polkadot-new-dot-logo.svg"
      alt="Polkadot Logo"
      className={cn("h-12 w-12", className)}
      {...props}
    />
  )
} 