"use client"

import * as React from "react"
import { cn } from "@/src/lib/utils"

type ImageStatus = "loading" | "loaded" | "error"
const AvatarContext = React.createContext<{ status: ImageStatus; setStatus: (s: ImageStatus) => void } | null>(null)

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const [status, setStatus] = React.useState<ImageStatus>("loading")

    return (
      <AvatarContext.Provider value={{ status, setStatus }}>
        <div
          ref={ref}
          className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
          {...props}
        />
      </AvatarContext.Provider>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, src, ...props }, ref) => {
    const context = React.useContext(AvatarContext)
    const { setStatus, status } = context || { setStatus: () => {}, status: "loaded" }

    React.useLayoutEffect(() => {
      if (src) setStatus("loading")
    }, [src, setStatus])

    return (
      <img
        ref={ref}
        src={src}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn("aspect-square h-full w-full object-cover", status !== "loaded" && "hidden", className)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(AvatarContext)
    const status = context?.status || "error"

    if (status === "loaded") return null

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted bg-gray-100 text-gray-600",
          className
        )}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }