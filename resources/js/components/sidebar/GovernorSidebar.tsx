import {
    Building2,
    CalendarClock,
    CircleDot,
    Cpu,
    Fingerprint,
    House,
    IdCard,
    LayoutDashboard,
    LayoutGrid,
    Layers,
    MapPin,
    UserCog,
} from "lucide-react";

import { dashboard } from "@/routes/governor";
import { index as countdown } from "@/routes/governor/countdown";
import { index as eos } from "@/routes/governor/eos";
import { index as cvrsReport } from "@/routes/governor/cvrs-report";
import { index as accreditations } from "@/routes/governor/accreditations";
import { index as bivas } from "@/routes/governor/bivas";
import { index as states } from "@/routes/governor/states";
import { index as zones } from "@/routes/governor/zones";
import { index as lgas } from "@/routes/governor/lgas";
import { index as wards } from "@/routes/governor/wards";
import { index as pus } from "@/routes/governor/pus";
// import { index as users } from "@/routes/governor/coordinators";

import SideNavList, { type NavLinkItem } from "./SideNavList";

const primary: NavLinkItem[] = [
    {
        name: "Dashboard",
        path: dashboard(),
        exact: true,
        icon: <LayoutDashboard size={16} />,
    },
    {
        name: "Countdown",
        path: countdown(),
        icon: <CalendarClock size={16} />,
    },
    {
        name: "State EOs",
        path: eos(),
        icon: <MapPin size={16} />,
    },
    {
        name: "CVR Report",
        path: cvrsReport(),
        icon: <IdCard size={16} />,
    },
    {
        name: "Accreditations",
        path: accreditations(),
        icon: <Fingerprint size={16} />,
    },
    {
        name: "BIVAS",
        path: bivas(),
        icon: <Cpu size={16} />,
    },
    // {
    //     name: "States",
    //     path: states(),
    //     icon: <House size={16} />,
    // },
    {
        name: "Zones",
        path: zones(),
        icon: <Layers size={16} />,
    },
    {
        name: "LGAs",
        path: lgas(),
        icon: <Building2 size={16} />,
    },
    {
        name: "Wards",
        path: wards(),
        icon: <LayoutGrid size={16} />,
    },
    {
        name: "Polling Units",
        path: pus(),
        icon: <CircleDot size={16} />,
    },
    // {
    //     name: "Coordinators",
    //     path: users(),
    //     icon: <UserCog size={16} />,
    // },
];

const secondary: NavLinkItem[] = [];

export default function GovernorSidebar() {
    return (
        <SideNavList
            primary={primary}
            secondary={secondary}
            secondaryLabel="Administration"
        />
    );
}