import { useEffect, useState } from "react"
import { AreaChart } from "./AreaChart"
import { Barchart } from "./Barchart"
import { PieDonut } from "./PieDonut"
import {
  Users,
  MapPin,
  Fingerprint,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// ─── Animated Counter ────────────────────────────────────
function useCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const counter = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(counter)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(counter)
  }, [target, duration])

  return count.toLocaleString()
}

// ─── Single Card (hook called at component level) ────────
type CardDef = {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
  trend?: "up" | "down"
  trendValue?: string
}

function SummaryCard({ card }: { card: CardDef }) {
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

// ─── Summary Cards Grid ──────────────────────────────────
function SummaryCards({ cards }: { cards: CardDef[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} card={card} />
      ))}
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
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
      <div className="flex items-center gap-2 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full self-start sm:self-auto whitespace-nowrap">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
        LIVE
      </div>
    </div>
  )
}

// ─── LGA Summary ─────────────────────────────────────────
const lgaData = [
  { name: "Calabar Municipal", count: 72104 },
  { name: "Akamkpa",           count: 45721 },
  { name: "Odukpani",          count: 40567 },
  { name: "Calabar South",     count: 33034 },
  { name: "Abi",               count: 27653 },
  { name: "Etung",             count: 21890 },
]

const totalLGA = lgaData.reduce((a, b) => a + b.count, 0)

function LGASummary() {
  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-center gap-2 font-semibold mb-4 text-sm">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        LGA Total Summary
      </div>
      <div className="space-y-3">
        {lgaData.map((lga) => {
          const pct = Math.round((lga.count / totalLGA) * 100)
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

// ─── Main ─────────────────────────────────────────────────
export default function AdminMain() {
  const summaryCards: CardDef[] = [
    {
      label: "Total Voters",
      value: 321489,
      icon: Users,
      trend: "up",
      trendValue: "+4.2% this month",
      gradient: "from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700",
    },
    {
      label: "Active Centres",
      value: 196,
      icon: MapPin,
      trend: "up",
      trendValue: "+3 new centres",
      gradient: "from-blue-50 to-blue-100/50 border-blue-200 text-blue-700",
    },
    {
      label: "Daily Captures",
      value: 13720,
      icon: Fingerprint,
      trend: "up",
      trendValue: "+8.1% vs yesterday",
      gradient: "from-amber-50 to-amber-100/50 border-amber-200 text-amber-700",
    },
    {
      label: "Monthly Captures",
      value: 411600,
      icon: CalendarDays,
      trend: "up",
      trendValue: "+12% vs last month",
      gradient: "from-purple-50 to-purple-100/50 border-purple-200 text-purple-700",
    },
    {
      label: "Verified",
      value: 300000,
      icon: TrendingUp,
      trend: "up",
      trendValue: "+5.7% verified",
      gradient: "from-rose-50 to-rose-100/50 border-rose-200 text-rose-700",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader
        title="Governor's Dashboard"
        sub="CROSS RIVER STATE · INEC VOTER REGISTRATION MONITOR"
      />

      <SummaryCards cards={summaryCards} />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <AreaChart />
        <PieDonut />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <LGASummary />
        <Barchart />
      </div>
    </div>
  )
}