import { Head } from "@inertiajs/react";
import DashboardLayout from "@/pages/dashboard/components/DashboardLayout";
import AdminSideNavLinks from "./AdminSideNavLinks";
import AdminMain from "./main/AdminMain";

export default function Admin() {
    return (
        <>
            <Head title="Admin Dashboard" />
            <DashboardLayout SideNavigation={AdminSideNavLinks}>
                <AdminMain />
            </DashboardLayout>
        </>
    );
}