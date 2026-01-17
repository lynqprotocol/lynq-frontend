import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-[#2A2A35] bg-bg-obsidian px-3 py-2 text-sm text-text-starlight placeholder:text-text-metal/50 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:border-brand-ultraviolet focus:shadow-[0_0_10px_rgba(138,46,255,0.2)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
