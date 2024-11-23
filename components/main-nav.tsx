import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-2", className)}
      {...props}
    >
      <Link href="/" className="flex items-center space-x-2">
        <Image 
          src="/images/xtakelogo.png" 
          alt="XTake Logo" 
          width={32} 
          height={32} 
        />
        <span className="text-xl font-bold">Xtake</span>
      </Link>
    </nav>
  )
}

