import {
    Building2,
    CalendarClock,
    CircleDot,
    CloudUpload,
    Fingerprint,
    Cpu,
    House,
    IdCard,
    LayoutDashboard,
    LayoutGrid,
    Layers,
    MapPin,
    ShieldCheck,
    UserCog,
    Vote,
    SlidersHorizontal,
    ClipboardCheck,
    FileBadge,
    ClipboardList,
    Users
} from "lucide-react";

import { dashboard } from "@/routes/admin";
import { index as accreditations } from "@/routes/admin/accreditations";
import { index as bivas } from "@/routes/admin/bivas";
import { index as countdown } from "@/routes/admin/countdown";
import { index as cvrs } from "@/routes/admin/cvrs";
import {
    index as elections,
    readiness,
} from "@/routes/admin/elections";
import { index as eos } from "@/routes/admin/eos";
import { index as lgas } from "@/routes/admin/lgas";
import { index as manageAccreditation } from "@/routes/admin/manage-accreditation";
import { index as manageResults } from "@/routes/admin/manage-results";
import { index as pus } from "@/routes/admin/pus";
import { index as staff } from "@/routes/admin/staff";
import { index as states } from "@/routes/admin/states";
import { index as upload } from "@/routes/admin/upload";
import { index as users } from "@/routes/admin/users";
import { index as wards } from "@/routes/admin/wards";
import { index as zones } from "@/routes/admin/zones";
import { index as cvrsReport } from "@/routes/admin/cvrs-report";


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
        name: "Nationwide EOs",
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
    {
        name: "States",
        path: states(),
        icon: <House size={16} />,
    },
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
];

const secondary: NavLinkItem[] = [
    {
        name: "Upload CSV",
        path: upload(),
        icon: <CloudUpload size={16} />,
    },
    {
        name: "Manage Users",
        path: users(),
        icon: <UserCog size={16} />,
    },
    {
        name: "Manage CVRs",
        path: cvrs(),
        icon: <FileBadge size={16} />,
    },
    {
        name: "Manage Results",
        path: manageResults(),
        icon: <ClipboardList size={16} />,
    },
    {
        name: "Manage Elections",
        path: elections(),
        icon: <Vote size={16} />,
    },
    {
        name: "Election Readiness",
        path: readiness(),
        icon: <ShieldCheck size={16} />,
    },
    {
        name: "Mnge Accreditations",
        path: manageAccreditation(),
        icon: <ClipboardCheck size={16} />,
    },
    {
        name: "Staffing",
        path: staff(),
        icon: <Users size={16} />,
    },
    {
        name: "Settings",
        path: staff(),
        icon: <SlidersHorizontal size={16} />,
    }
];

export default function AdminSidebar() {
    return (
        <SideNavList
            primary={primary}
            secondary={secondary}
            secondaryLabel="Administration"
        />
    );
}