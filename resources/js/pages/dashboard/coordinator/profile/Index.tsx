import { useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import ProfileCard from "./ProfileCard";
import EmailCard from "./EmailCard";
import PasswordCard from "./PasswordCard";

interface Role {
    id: string;
    name: string;
}

interface Profile {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role?: Role;
    created_at: string;
}

interface PageProps {
    profile: Profile;
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

export default function ProfileIndex() {
    const { props } = usePage<PageProps>();
    const { profile, flash } = props;

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    return (
        <>
            <Head title="My Profile" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="My Profile"
                sub="Manage your account information"
                live={false}
            >
                <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
                    {/* Left — Identity */}
                    <div className="animate-[fadeSlideIn_0.3s_0.05s_ease_both] h-full">
                        <ProfileCard profile={profile} />
                    </div>

                    {/* Right — Email + Password */}
                    <div className="space-y-5">
                        <div className="animate-[fadeSlideIn_0.3s_0.12s_ease_both]">
                            <EmailCard email={profile.email} />
                        </div>
                        <div className="animate-[fadeSlideIn_0.3s_0.19s_ease_both]">
                            <PasswordCard />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}