import { CheckCircle2 } from "lucide-react"
import type { SidebarLayoutMode } from "@/context/SidebarLayoutContext"
import { cn } from "@/lib/utils"

interface SidebarLayoutPreviewProps {
  variant: SidebarLayoutMode
  selected?: boolean
}

export default function SidebarLayoutPreview({
  variant,
  selected = false,
}: SidebarLayoutPreviewProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-md border-2 border-muted bg-background p-1.5 transition-colors",
        selected ? "border-primary hover:border-primary" : "hover:border-accent"
      )}
    >
      {selected && (
        <CheckCircle2 className="absolute -top-2 -right-2 size-5 rounded-full bg-background fill-primary text-background" />
      )}

      <div
        className={cn(
          "rounded-sm bg-[#eef2ff] p-1.5 transition-shadow dark:bg-slate-900",
          selected && "ring-1 ring-primary/35 shadow-[0_0_0_1px_rgba(37,99,235,0.12)]"
        )}
      >
        <div className="flex gap-1.5">
          {variant === "icon" ? (
            <div className="flex w-4 flex-col gap-1 rounded-sm bg-slate-500/80 p-1 dark:bg-slate-400/80">
              <div className="h-1 rounded bg-white/90" />
              <div className="h-1 rounded bg-white/90" />
              <div className="h-1 rounded bg-white/90" />
              <div className="mt-auto h-3 rounded bg-white/60" />
            </div>
          ) : (
            <div className="w-5 rounded-sm border border-dashed border-slate-300/80 bg-white/70 dark:border-slate-700 dark:bg-slate-950/60" />
          )}

          <div className="flex min-h-[54px] flex-1 flex-col gap-1.5 rounded-sm bg-white p-1.5 shadow-sm dark:bg-slate-800">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="h-1.5 w-10 rounded bg-slate-400/80" />
                <div className="h-1.5 w-7 rounded bg-slate-300/80" />
              </div>
              <div className="size-5 rounded-full bg-slate-300/90 dark:bg-slate-500/80" />
            </div>
            <div className="mt-auto flex items-end justify-between gap-1.5">
              <div className="h-5 flex-1 rounded bg-slate-200/90 dark:bg-slate-600/70" />
              <div className="flex items-end gap-1">
                <div className="h-2.5 w-1.5 rounded bg-slate-400/80" />
                <div className="h-4 w-1.5 rounded bg-slate-400/80" />
                <div className="h-5.5 w-1.5 rounded bg-slate-400/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
