import { MapPin } from "lucide-react"

export type LGAItem = {
  name: string
  count: number
}

interface Props {
  data: LGAItem[]
  title?: string
}

export function LGASummary({ data, title = "LGA Total Summary" }: Props) {
  const total = data.reduce((a, b) => a + b.count, 0)

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-center gap-2 font-semibold mb-4 text-sm">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        {title}
      </div>
      <div className="space-y-3">
        {data.map((lga) => {
          const pct = Math.round((lga.count / total) * 100)
          return (
            <div key={lga.name} className="space-y-1">
              <div className="flex justify-between text-xs gap-2">
                <span className="truncate">{lga.name}</span>
                <span className="tabular-nums flex-shrink-0">{lga.count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}