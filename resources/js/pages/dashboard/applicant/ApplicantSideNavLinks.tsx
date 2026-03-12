import { Link, usePage } from "@inertiajs/react";
import { History, Landmark, LayoutGrid, CircleUser, UsersRound } from "lucide-react";
import useRole from "@/hooks/auth/useRole";

const AdminSideNavLinks = () => {
    const { url } = usePage();
    const role = useRole();

    const links = [
        {
            name: "Dashboard",
            path: "/dashboard",
            compare: url === "/dashboard",
            icon: <LayoutGrid size={20} />,
            excludes: [] as string[],
        },
        {
            name: "View Election Time",
            path: "/elections/time",
            compare: url.startsWith("/elections/time"),
            icon: <UsersRound size={20} />,
            excludes: [] as string[],
        },
        {
            name: "LGA SPOs",
            path: "/lgas/spos",
            compare: url.startsWith("/lgas/spos"),
            icon: <History size={20} />,
            excludes: [] as string[],
        },
        {
            name: "Manage Users",
            path: "/dashboard/users",
            compare: url.startsWith("/dashboard/users"),
            icon: <CircleUser size={20} />,
            excludes: ["chairman", "hakimi"],
        },
        {
            name: "Invoices",
            path: "/dashboard/invoices",
            compare: url.startsWith("/dashboard/invoices"),
            icon: <Landmark size={20} />,
            excludes: ["chairman", "hakimi"],
        },
    ];

    return (
        <div className="space-y-2">
            {links.map((link) =>
                role && link.excludes.includes(role) ? null : (
                    <Link
                        key={link.name}
                        href={link.path}
                        className={`group relative flex items-center gap-3 
                                    px-4 py-3 rounded-xl transition-all duration-200
                                    ${
                                        link.compare
                                            ? "bg-green-50 text-green-700 font-semibold"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
                                    }`}
                    >
                        {/* Left Active Indicator */}
                        {link.compare && (
                            <span className="absolute left-0 top-0 h-full w-1 bg-green-600 rounded-r-full"></span>
                        )}

                        <span className="transition-transform group-hover:scale-110">
                            {link.icon}
                        </span>

                        <span className="text-sm tracking-wide">
                            {link.name}
                        </span>
                    </Link>
                )
            )}
        </div>
    );
};

export default AdminSideNavLinks;