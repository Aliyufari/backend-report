import { Users, MapPin, Fingerprint, TrendingUp, CalendarDays } from "lucide-react"
import { SummaryCards, type CardDef } from "@/components/ui/dashboard/SummaryCard"
import { LGASummary } from "@/components/ui/dashboard/LGASummary"
import { AreaChart } from "@/components/charts/AreaChart"
import { Barchart } from "@/components/charts/Barchart"
import { PieDonut } from "@/components/charts/PieDonut"

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

const lgaData = [
  { name: "Calabar Municipal", count: 72104 },
  { name: "Akamkpa",           count: 45721 },
  { name: "Odukpani",          count: 40567 },
  { name: "Calabar South",     count: 33034 },
  { name: "Abi",               count: 27653 },
  { name: "Etung",             count: 21890 },
]

export default function Main() {
  return (
    <>
      <SummaryCards cards={summaryCards} />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="min-w-0"><AreaChart /></div>
        <div className="min-w-0"><PieDonut /></div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="min-w-0"><LGASummary data={lgaData} /></div>
        <div className="min-w-0"><Barchart /></div>
      </div>
    </>
  )
}