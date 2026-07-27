import {
    LayoutDashboard,
    CalendarClock,
    MapPin,
    UserCog,
    IdCard,
    Fingerprint,
} from "lucide-react";

import SideNavList, { type NavLinkItem } from "./SideNavList";

export default function CoordinatorSidebar() {
    const primary: NavLinkItem[] = [
        {
            name: "Dashboard",
            path: route("coordinator.dashboard"),
            matchPrefix: route("coordinator.dashboard"),
            icon: <LayoutDashboard size={16} />,
        },
        {
            name: "Election Countdown",
            path: route("coordinator.countdown.index"),
            matchPrefix: route("coordinator.countdown.index"),
            icon: <CalendarClock size={16} />,
        },
        {
            name: "My Area EOs",
            path: route("coordinator.eos.index"),
            matchPrefix: route("coordinator.eos.index"),
            icon: <MapPin size={16} />,
        },
        {
            name: "CVR Records",
            path: route("coordinator.cvrs.index"),
            matchPrefix: route("coordinator.cvrs.index"),
            icon: <IdCard size={16} />,
        },
        {
            name: "Accreditations",
            path: route("coordinator.accreditations.index"),
            matchPrefix: route("coordinator.accreditations.index"),
            icon: <Fingerprint size={16} />,
        },
    ];

    const secondary: NavLinkItem[] = [
        {
            name: "Coordinators",
            path: route("coordinator.users.index"),
            matchPrefix: route("coordinator.users.index"),
            icon: <UserCog size={16} />,
        },
    ];

    return (
        <SideNavList
            primary={primary}
            secondary={secondary}
            secondaryLabel="Management"
        />
    );
}