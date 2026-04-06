import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      position="bottom-right"
      closeButton
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          zIndex: 2147483647,
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          borderColor: "var(--border)",
          pointerEvents: "auto",
        },
        classNames: {
          title: "text-foreground",
          description: "text-secondary-foreground opacity-100",
          closeButton:
            "pointer-events-auto border-border bg-background text-muted-foreground transition-all duration-150 hover:scale-105 hover:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
