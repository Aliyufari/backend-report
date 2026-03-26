import { useForm } from "@inertiajs/react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import users from "@/routes/users";
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
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        if (!user) return;
        destroy(users.destroy(user.id).url, {
            onSuccess: () => { toast.success("User deleted successfully."); onClose(); },
            onError:   () => toast.error("Failed to delete user."),
        });
    };

    if (!open || !user) return null;

    return (
        <Portal>
            <div
                style={{
                    position: "fixed", inset: 0, zIndex: 110,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 16, animation: "fadeIn 0.15s ease",
                }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div style={{
                    background: "var(--card)", borderRadius: 14, width: "100%", maxWidth: 400,
                    padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                    animation: "slideUp 0.2s ease", border: "1px solid var(--border)",
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "color-mix(in oklch, var(--destructive) 12%, transparent)",
                        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                    }}>
                        <Trash2 size={20} style={{ color: "var(--destructive)" }} />
                    </div>

                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                        Delete User
                    </p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                        Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{user.name}</strong>?
                        This action cannot be undone.
                    </p>

                    <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                        <button onClick={onClose} style={{
                            padding: "8px 18px", borderRadius: 8, fontSize: 13,
                            fontFamily: "'Syne', sans-serif", fontWeight: 600,
                            border: "1px solid var(--border)", background: "transparent",
                            color: "var(--foreground)", cursor: "pointer",
                        }}>
                            Cancel
                        </button>
                        <button onClick={handleDelete} disabled={processing} style={{
                            padding: "8px 18px", borderRadius: 8, fontSize: 13,
                            fontFamily: "'Syne', sans-serif", fontWeight: 600,
                            background: "var(--destructive)", color: "white",
                            border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            opacity: processing ? 0.6 : 1,
                        }}>
                            {processing && <Loader2 size={13} className="animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}