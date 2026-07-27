import { useForm } from "@inertiajs/react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import users from "@/routes/admin/users";
import Portal from "@/components/Portal";

interface User {
    id: string;
    name: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

export default function DeleteUserModal({ open, onClose, user }: Props) {
    const { delete: destroy, processing, errors } = useForm({});

    const handleDelete = () => {
        if (!user) return;
        destroy(users.destroy(user.id).url, {
            onSuccess: () => onClose(),
            onError: () => {
                toast.error(errors.general ?? "Failed to delete user. Please try again.");
            },
        });
    };

    if (!open || !user) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card border border-border rounded-[14px] w-full max-w-md p-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">

                    <div className="w-11 h-11 rounded-full bg-destructive/12 flex items-center justify-center mb-4 mx-auto">
                        <Trash2 size={20} className="text-destructive flex-shrink-0" strokeWidth={2} />
                    </div>

                    <p className="font-['Syne',sans-serif] text-base font-bold text-foreground mb-2 text-center">
                        Delete User
                    </p>

                    <p className="font-['DM_Mono',monospace] text-xs text-muted-foreground leading-relaxed text-center max-w-xs mx-auto">
                        Are you sure you want to delete{" "}
                        <strong className="text-foreground">{user.name}</strong>?
                        This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-center gap-2.5 mt-6">
                        <button
                            onClick={onClose}
                            className="px-[18px] py-2 rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold border border-border bg-transparent text-foreground cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="flex items-center justify-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold bg-destructive text-white border-none cursor-pointer disabled:opacity-60"
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