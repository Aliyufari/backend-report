import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import Main from "./Main";

export default function Admin() {
    return (
        <>
            <Head title="Admin Dashboard" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Governor's Dashboard"
                sub="CROSS RIVER STATE · INEC VOTER REGISTRATION MONITOR"
                live
            >
                <Main />
            </AppLayout>
        </>
    );
}