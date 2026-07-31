import { useEffect } from "react";
import { usePage, useForm, Head } from "@inertiajs/react";
import { CalendarClock, Loader, Settings as SettingsIcon, Building } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import settingsRoutes from "@/routes/admin/settings";

interface Settings {
    election_countdown_date: string | null;
    election_countdown_label: string | null;
    site_name: string | null;
    support_email: string | null;
}

interface PageProps {
    settings: Settings;
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block mb-1.5 font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 font-['DM_Mono',monospace] text-[11px] text-destructive">{message}</p>;
}

function SectionCard({ icon: Icon, title, description, children }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    <Icon size={16} className="text-primary" />
                </div>
                <div>
                    <p className="font-['Syne',sans-serif] text-[14px] font-bold text-foreground">{title}</p>
                    <p className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground mt-0.5">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

const fieldCls = (error?: string) =>
    `w-full px-3 py-[9px] rounded-lg text-[13px] font-['DM_Mono',monospace]
     text-foreground bg-background outline-none transition-colors
     border ${error ? "border-destructive" : "border-border"} focus:border-primary`;

export default function SettingsIndex() {
    const { props } = usePage<PageProps>();
    const { settings, flash } = props;

    const { data, setData, put, processing, errors } = useForm({
        election_countdown_date:  settings.election_countdown_date  ?? "",
        election_countdown_label: settings.election_countdown_label ?? "",
        site_name:                settings.site_name                ?? "",
        support_email:            settings.support_email            ?? "",
    });

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(settingsRoutes.update().url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Settings" />
            <AppLayout SideNavigation={AdminSidebar} title="Settings" sub="General system configuration" live={false}>
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

                    {errors.general && (
                        <div className="px-3 py-2.5 rounded-lg text-[12px] font-['DM_Mono',monospace]
                            bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                            border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] text-destructive">
                            {errors.general}
                        </div>
                    )}

                    {/* Election Countdown */}
                    <SectionCard
                        icon={CalendarClock}
                        title="Election Countdown"
                        description="Controls the date and label shown on the countdown page."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Countdown Date</Label>
                                <input
                                    type="datetime-local"
                                    className={fieldCls(errors.election_countdown_date)}
                                    value={data.election_countdown_date}
                                    onChange={e => setData("election_countdown_date", e.target.value)}
                                />
                                <FieldError message={errors.election_countdown_date} />
                            </div>
                            <div>
                                <Label>Countdown Label</Label>
                                <input
                                    className={fieldCls(errors.election_countdown_label)}
                                    placeholder="e.g. 2027 General Election"
                                    value={data.election_countdown_label}
                                    onChange={e => setData("election_countdown_label", e.target.value)}
                                />
                                <FieldError message={errors.election_countdown_label} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* General */}
                    <SectionCard
                        icon={Building}
                        title="General"
                        description="Basic organization details used across the platform."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Site Name</Label>
                                <input
                                    className={fieldCls(errors.site_name)}
                                    placeholder="Backend Report"
                                    value={data.site_name}
                                    onChange={e => setData("site_name", e.target.value)}
                                />
                                <FieldError message={errors.site_name} />
                            </div>
                            <div>
                                <Label>Support Email</Label>
                                <input
                                    type="email"
                                    className={fieldCls(errors.support_email)}
                                    placeholder="support@inec.gov.ng"
                                    value={data.support_email}
                                    onChange={e => setData("support_email", e.target.value)}
                                />
                                <FieldError message={errors.support_email} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Save */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-1.5 px-5 py-[9px] rounded-lg text-[13px]
                                font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground
                                border-none cursor-pointer disabled:opacity-60 transition-opacity"
                        >
                            {processing && <Loader size={14} className="animate-spin" />}
                            Save Settings
                        </button>
                    </div>
                </form>
            </AppLayout>
        </>
    );
}