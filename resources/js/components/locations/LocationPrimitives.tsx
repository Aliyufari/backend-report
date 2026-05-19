import React from "react";
import { useForm } from "@inertiajs/react";
import { Loader2, Trash2, X, Loader } from "lucide-react";
import Portal from "@/components/Portal";

// ── Field primitives ──────────────────────────────────────────────────────────

export function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground block mb-1.5">
            {children}
        </label>
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="font-['DM_Mono',monospace] text-[11px] text-destructive mt-1">{message}</p>
    );
}

export function Input({
    error,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    return (
        <input
            {...props}
            className={`w-full px-3 py-[9px] rounded-lg text-[13px] font-['DM_Mono',monospace]
                text-foreground bg-background outline-none transition-colors
                border ${error ? "border-destructive" : "border-border"}
                focus:border-primary`}
        />
    );
}

export function Select({
    error,
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
    return (
        <select
            {...props}
            className={`w-full px-3 py-[9px] pr-8 rounded-lg text-[13px] font-['DM_Mono',monospace]
                text-foreground bg-background outline-none cursor-pointer appearance-none transition-colors
                border ${error ? "border-destructive" : "border-border"}
                focus:border-primary
                bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
                bg-no-repeat bg-[right_12px_center]`}
        >
            {children}
        </select>
    );
}

// ── Generic Delete Modal ──────────────────────────────────────────────────────

interface DeleteModalProps {
    open: boolean;
    onClose: () => void;
    url: string;
    label: string;
    name: string;
}

export function DeleteModal({ open, onClose, url, label, name }: DeleteModalProps) {
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        destroy(url, { onSuccess: () => onClose(), onError: () => {} });
    };

    if (!open) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center p-4
                    bg-black/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card border border-border rounded-[14px] w-full max-w-md
                    p-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">

                    <div className="w-11 h-11 rounded-full bg-destructive/12 flex items-center justify-center mb-4 mx-auto">
                        <Trash2 size={20} className="text-destructive flex-shrink-0" strokeWidth={2} />
                    </div>

                    <p className="font-['Syne',sans-serif] text-base font-bold text-foreground mb-2 text-center">
                        Delete {label}
                    </p>

                    <p className="font-['DM_Mono',monospace] text-xs text-muted-foreground leading-relaxed
                        text-center max-w-xs mx-auto">
                        Are you sure you want to delete{" "}
                        <strong className="text-foreground">{name}</strong>?
                        This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-center gap-2.5 mt-6">
                        <button
                            onClick={onClose}
                            className="px-[18px] py-2 rounded-lg text-[13px] font-['Syne',sans-serif]
                                font-semibold border border-border bg-transparent text-foreground cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="flex items-center justify-center gap-1.5 px-[18px] py-2 rounded-lg
                                text-[13px] font-['Syne',sans-serif] font-semibold bg-destructive text-white
                                border-none cursor-pointer disabled:opacity-60"
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

// ── Generic Modal Shell ───────────────────────────────────────────────────────

interface LocationModalShellProps {
    open: boolean;
    onClose: () => void;
    title: string;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    isEdit: boolean;
    children: React.ReactNode;
}

export function LocationModalShell({
    open, onClose, title, processing, onSubmit, isEdit, children,
}: LocationModalShellProps) {
    if (!open) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center
                    px-4 py-6 overflow-y-auto bg-black/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl
                    w-full max-w-[520px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="bg-transparent border-none cursor-pointer text-muted-foreground
                                hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
                        {children}

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif]
                                    font-semibold border border-border bg-transparent text-foreground
                                    cursor-pointer hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-1.5 px-5 py-[9px] rounded-lg text-[13px]
                                    font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground
                                    border-none cursor-pointer disabled:opacity-60 transition-opacity"
                            >
                                {processing && <Loader size={14} className="animate-spin" />}
                                {isEdit ? "Save Changes" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}