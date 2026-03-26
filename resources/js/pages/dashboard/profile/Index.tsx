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
                <style>{`
                    @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');

                    @keyframes fadeSlideIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .profile-card {
                        animation: fadeSlideIn 0.3s ease both;
                        height: 100%;
                    }
                    .profile-card:nth-child(1) { animation-delay: 0.05s; }
                    .profile-card:nth-child(2) { animation-delay: 0.12s; }
                    .profile-card:nth-child(3) { animation-delay: 0.19s; }

                    /* Shared modal styles injected here so all child modals inherit */
                    .profile-modal-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 200;
                        background: rgba(0,0,0,0.5);
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 16px;
                        overflow-y: auto;
                        animation: fadeIn 0.15s ease;
                    }

                    .profile-modal-box {
                        background: var(--card);
                        border-radius: 16px;
                        width: 100%;
                        max-width: 480px;
                        max-height: calc(100dvh - 48px);
                        overflow-y: auto;
                        box-shadow: 0 24px 60px rgba(0,0,0,0.2);
                        border: 1px solid var(--border);
                        animation: slideUp 0.2s ease;
                        flex-shrink: 0;
                    }

                    @keyframes fadeIn  { from { opacity: 0 }              to { opacity: 1 } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                `}</style>

                <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
                    {/* Left — Identity */}
                    <div className="profile-card">
                        <ProfileCard profile={profile} />
                    </div>

                    {/* Right — Email + Password */}
                    <div className="space-y-5">
                        <div className="profile-card">
                            <EmailCard email={profile.email} />
                        </div>
                        <div className="profile-card">
                            <PasswordCard />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}