import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import UploadPage from "./UploadPage";

export default function Upload() {
    return (
        <>
            <Head title="Upload Records" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Upload State Records"
                sub="Import polling units via Excel or CSV"
                live={false}
            >
                <UploadPage />
            </AppLayout>
        </>
    );
}