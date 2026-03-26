import { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { echo } from "@/echo";
import upload from "@/routes/upload";

type UploadStatus = "idle" | "pending" | "processing" | "done" | "failed";

interface UploadProgress {
    upload_id: string;
    status: UploadStatus;
    percent: number;
    message: string;
    updated_at: string;
}

interface PageProps {
    existingProgress?: UploadProgress | null;
    auth: { user: { id: number } };
    [key: string]: unknown;
}

function ProgressBar({ progress }: { progress: UploadProgress }) {
    const statusConfig: Record<UploadStatus, { color: string; bg: string; icon: React.ReactNode }> = {
        idle:       { color: "bg-zinc-400",    bg: "bg-zinc-50",    icon: null },
        pending:    { color: "bg-amber-400",   bg: "bg-amber-50",   icon: <Loader2 size={16} className="animate-spin text-amber-500" /> },
        processing: { color: "bg-blue-500",    bg: "bg-blue-50",    icon: <Loader2 size={16} className="animate-spin text-blue-500" /> },
        done:       { color: "bg-emerald-500", bg: "bg-emerald-50", icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
        failed:     { color: "bg-red-500",     bg: "bg-red-50",     icon: <AlertCircle size={16} className="text-red-500" /> },
    };

    const cfg = statusConfig[progress.status];

    return (
        <div className={`w-full rounded-xl border p-4 space-y-3 ${cfg.bg}`} style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {cfg.icon}
                    <span className="text-sm font-medium" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {progress.status === "done"       ? "Import Complete"  :
                         progress.status === "failed"     ? "Import Failed"    :
                         progress.status === "processing" ? "Importing..."     : "Queued"}
                    </span>
                </div>
                <span className="text-xs tabular-nums font-semibold"
                    style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                    {progress.percent}%
                </span>
            </div>

            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${cfg.color}`}
                    style={{ width: `${progress.percent}%` }}
                />
            </div>

            <p className="text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                {progress.message}
            </p>

            {(progress.status === "done" || progress.status === "failed") && (
                <p className="text-[10px]" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                    Last updated: {new Date(progress.updated_at).toLocaleString()}
                </p>
            )}
        </div>
    );
}

export default function UploadPage() {
    const { props } = usePage<PageProps>();
    const userId = props.auth.user.id;

    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(props.existingProgress ?? null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        echo
            .private(`upload.${userId}`)
            .listen(".progress.updated", (data: UploadProgress) => {
                setProgress(data);
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
            });
        return () => { echo.leave(`upload.${userId}`); };
    }, [userId]);

    const startPolling = (uploadId: string) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(upload.progress(uploadId).url, {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                });
                const data: UploadProgress = await res.json();
                setProgress(data);
                if (data.status === "done" || data.status === "failed") {
                    clearInterval(pollRef.current!);
                    pollRef.current = null;
                }
            } catch {
                clearInterval(pollRef.current!);
                pollRef.current = null;
            }
        }, 3000);
    };

    useEffect(() => {
        if (progress?.status === "pending" || progress?.status === "processing") {
            startPolling(progress.upload_id);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    const handleFile = (f: File) => {
        if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error("Only .xlsx, .xls, or .csv files are allowed.");
            return;
        }
        setFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
            "_token",
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ""
        );
        try {
            const res = await fetch(upload.store().url, {
                method: "POST",
                headers: { "X-Requested-With": "XMLHttpRequest" },
                body: formData,
            });
            const data = await res.json();
            if (data.upload_id) {
                setProgress({
                    upload_id: data.upload_id,
                    status: "pending",
                    percent: 0,
                    message: "Queued for processing...",
                    updated_at: new Date().toISOString(),
                });
                setFile(null);
                startPolling(data.upload_id);
            } else {
                toast.error(data.message ?? "Upload failed.");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const isActive = progress?.status === "pending" || progress?.status === "processing";

    return (
        <>
            <style>{`
                @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');
                .upload-zone {
                    border: 2px dashed var(--border);
                    transition: all 0.2s ease;
                }
                .upload-zone.drag-over {
                    border-color: var(--primary);
                    background: color-mix(in oklch, var(--primary) 5%, transparent);
                }
                .upload-zone:hover {
                    border-color: color-mix(in oklch, var(--primary) 50%, transparent);
                }
            `}</style>

            <div className="space-y-6">

                {progress && <ProgressBar progress={progress} />}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                    {/* Upload form */}
                    {!isActive && (
                        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5" style={{ borderColor: "var(--border)" }}>
                            <div>
                                <h2 className="font-bold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Select File
                                </h2>
                                <p className="text-xs mt-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                                    Accepts .xlsx, .xls, .csv — max 50MB
                                </p>
                            </div>

                            <div
                                className={`upload-zone rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer ${dragOver ? "drag-over" : ""}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                                    style={{ background: "color-mix(in oklch, var(--primary) 10%, transparent)" }}>
                                    <Upload size={24} style={{ color: "var(--primary)" }} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                                        Drop file here or <span style={{ color: "var(--primary)" }}>browse</span>
                                    </p>
                                    <p className="text-xs mt-1" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                                        XLSX · XLS · CSV
                                    </p>
                                </div>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                />
                            </div>

                            {file && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                                    style={{
                                        background: "color-mix(in oklch, var(--primary) 6%, transparent)",
                                        borderColor: "color-mix(in oklch, var(--primary) 25%, transparent)"
                                    }}>
                                    <FileSpreadsheet size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                                    <span className="text-sm font-medium flex-1 truncate" style={{ fontFamily: "'DM Mono', monospace" }}>
                                        {file.name}
                                    </span>
                                    <span className="text-xs flex-shrink-0"
                                        style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                    <button onClick={() => setFile(null)} className="text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!file || uploading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Syne', sans-serif", background: "var(--primary)", color: "var(--primary-foreground)" }}
                            >
                                {uploading
                                    ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                    : <><Upload size={16} /> Upload & Import</>
                                }
                            </button>
                        </div>
                    )}

                    {/* Column guide — sits to the right on large screens, below on mobile */}
                    <div className="bg-card border rounded-2xl p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-3"
                            style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                            Expected Column Headers
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {["state", "zone", "lga", "ra", "pu", "delim"].map((col) => (
                                <div key={col} className="text-center px-2 py-1.5 rounded-lg text-xs font-semibold"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        background: "color-mix(in oklch, var(--primary) 8%, transparent)",
                                        color: "var(--primary)",
                                        border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)"
                                    }}>
                                    {col}
                                </div>
                            ))}
                        </div>

                        <hr className="my-4" style={{ borderColor: "var(--border)" }} />

                        <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                            style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                            Column Descriptions
                        </p>
                        <div className="space-y-2">
                            {[
                                ["state", "State name"],
                                ["zone",  "Senatorial zone"],
                                ["lga",   "Local Government Area"],
                                ["ra",    "Registration Area (Ward)"],
                                ["pu",    "Polling Unit name"],
                                ["delim", "Polling Unit number"],
                            ].map(([col, desc]) => (
                                <div key={col} className="flex items-start gap-2 text-xs">
                                    <span className="font-semibold flex-shrink-0 w-12"
                                        style={{ fontFamily: "'DM Mono', monospace", color: "var(--primary)" }}>
                                        {col}
                                    </span>
                                    <span style={{ color: "var(--muted-foreground)" }}>{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}