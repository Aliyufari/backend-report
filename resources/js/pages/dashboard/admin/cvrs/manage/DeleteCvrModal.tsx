import { useForm } from "@inertiajs/react";
import { Loader2, Trash2 } from "lucide-react";
import cvrs from "@/routes/admin/cvrs";
import Portal from "@/components/Portal";

interface Cvr {
    id: string;
    unique_id: string;
}

interface Props {
    open:    boolean;
    onClose: () => void;
    cvr:     Cvr | null;
}

export default function DeleteCvrModal({ open, onClose, cvr }: Props) {
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        if (!cvr) return;
        destroy(cvrs.destroy(cvr.id).url, {
            onSuccess: () => onClose(),
            onError:   () => {},
        });
    };

    if (!open || !cvr) return null;

    return (
        <Portal>
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4
                    bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="bg-card border border-border rounded-[14px] w-full max-w-md p-7
                    shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-[slideUp_0.2s_ease]">

                    <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4
                        bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)]">
                        <Trash2 size={20} className="text-destructive" />
                    </div>

                    <p className="font-['Syne',sans-serif] text-base font-bold text-foreground mb-2">
                        Delete CVR Record
                    </p>
                    <p className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground leading-relaxed">
                        Are you sure you want to delete CVR{" "}
                        <strong className="text-foreground">{cvr.unique_id}</strong>?
                        This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-end gap-2.5 mt-6">
                        <button
                            onClick={onClose}
                            className="px-[18px] py-2 rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold
                                border border-border bg-transparent text-foreground cursor-pointer
                                hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px]
                                font-['Syne',sans-serif] font-semibold bg-destructive text-white
                                border-none cursor-pointer disabled:opacity-60 transition-opacity"
                        >
                            {processing && <Loader2 size={13} className="animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}