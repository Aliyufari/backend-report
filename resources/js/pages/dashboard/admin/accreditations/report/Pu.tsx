import { Head, Link } from "@inertiajs/react";
import { Download, ArrowLeft, FileWarning } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";

interface Accreditation {
    id: string;
    accredited_voters: number;
    status: string;
    image_path: string | null;
    election: { title: string };
}

interface Props {
    pu: { id: string; name: string; code?: string };
    accreditation: Accreditation | null;
    electionId: string;
}

export default function PuAccreditation({ pu, accreditation }: Props) {
    const imageUrl = accreditation?.image_path ? `/storage/${accreditation.image_path}` : null;

    return (
        <>
            <Head title={`Accreditation — ${pu.name}`} />
            <AppLayout SideNavigation={AdminSidebar} title={pu.name} sub={pu.code ? `PU Code: ${pu.code}` : "Polling Unit"} live={false}>
                <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground">
                    <ArrowLeft size={14} /> Back
                </button>

                {!accreditation ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-2xl">
                        <FileWarning size={28} className="text-muted-foreground mb-2" />
                        <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground">
                            No accreditation record uploaded for this polling unit yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Accreditation result" className="w-full h-auto object-contain" />
                            ) : (
                                <div className="flex items-center justify-center py-24 text-muted-foreground text-sm font-['DM_Mono',monospace]">
                                    No image uploaded.
                                </div>
                            )}
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-fit">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground font-['DM_Mono',monospace] mb-1">Election</p>
                                <p className="font-['Syne',sans-serif] font-semibold">{accreditation.election.title}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground font-['DM_Mono',monospace] mb-1">Accredited Voters</p>
                                <p className="text-2xl font-bold tabular-nums text-primary">{accreditation.accredited_voters.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground font-['DM_Mono',monospace] mb-1">Status</p>
                                <p className="capitalize font-['DM_Mono',monospace]">{accreditation.status}</p>
                            </div>

                            {imageUrl && (
                                <a
                                    href={imageUrl}
                                    download
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold
                                        font-['Syne',sans-serif] bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    <Download size={15} /> Download Image
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </AppLayout>
        </>
    );
}