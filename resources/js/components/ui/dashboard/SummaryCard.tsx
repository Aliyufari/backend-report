import { useCounter } from "@/hooks/dashboard/useCounter"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export type CardDef = {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  trend?: "up" | "down"
  trendValue?: string
}

export function SummaryCard({ card }: { card: CardDef }) {
  const animatedValue = useCounter(card.value)
  const Icon = card.icon

  return (
    <div
      className={`
        relative bg-gradient-to-br rounded-2xl p-4 border shadow-sm
        transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
        ${card.gradient}
      `}
    >
      <div className="absolute inset-0 rounded-2xl opacity-10 bg-white pointer-events-none" />
      <div className="relative flex flex-col justify-between h-full gap-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70 leading-tight">
            {card.label}
          </div>
          <Icon className="w-4 h-4 opacity-60 flex-shrink-0" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tabular-nums">{animatedValue}</div>
        {card.trendValue && (
          <div className="text-[10px] flex items-center gap-1 font-medium">
            {card.trend === "up" ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-red-500 flex-shrink-0" />
            )}
            <span className={card.trend === "up" ? "text-emerald-600" : "text-red-500"}>
              {card.trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function SummaryCards({ cards }: { cards: CardDef[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} card={card} />
      ))}
    </div>
  )
}