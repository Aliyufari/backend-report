import type { ReactNode } from "react"

interface Props {
  title: string
  sub?: string
  live?: boolean
  actions?: ReactNode
}

export function SectionHeader({ title, sub, live = true, actions }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        {sub && (
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
            {sub}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
        {actions}
        {live && (
          <div className="flex items-center gap-2 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full whitespace-nowrap">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
            LIVE
          </div>
        )}
      </div>
    </div>
  )
}