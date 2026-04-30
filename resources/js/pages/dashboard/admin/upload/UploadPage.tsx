import { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { echo } from "@/echo";
import upload from "@/routes/upload";

type UploadStatus = "pending" | "processing" | "done" | "failed";

interface UploadProgress {
    upload_id: string;
    status: UploadStatus | string | null;
    percent: number;
    message: string;
    updated_at: string;
}

interface PageProps {
    existingProgress?: UploadProgress | null;
    auth: { user: { id: number } };
    [key: string]: unknown;
}

// ── Column metadata ───────────────────────────────────────────────────────────

const COLUMNS: [string, string][] = [
    ["state", "State name"],
    ["zone",  "Senatorial zone"],
    ["lga",   "Local Government Area"],
    ["ra",    "Registration Area (Ward)"],
    ["pu",    "Polling Unit name"],
    ["delim", "Polling Unit number"],
];

// ── ProgressBar ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending: {
        bar:       "bg-amber-400",
        bg:        "bg-amber-50",
        icon:      <Loader size={16} className="animate-spin text-amber-500" />,
        label:     "Queued",
    },
    processing: {
        bar:       "bg-blue-500",
        bg:        "bg-blue-50",
        icon:      <Loader size={16} className="animate-spin text-blue-500" />,
        label:     "Importing...",
    },
    done: {
        bar:       "bg-emerald-500",
        bg:        "bg-emerald-50",
        icon:      <CheckCircle2 size={16} className="text-emerald-500" />,
        label:     "Import Complete",
    },
    failed: {
        bar:       "bg-red-500",
        bg:        "bg-red-50",
        icon:      <AlertCircle size={16} className="text-red-500" />,
        label:     "Import Failed",
    },
} satisfies Record<UploadStatus, { bar: string; bg: string; icon: React.ReactNode; label: string }>;

function ProgressBar({ progress }: { progress: UploadProgress }) {
    const safeStatus: UploadStatus =
        progress?.status && progress.status in STATUS_CONFIG
            ? (progress.status as UploadStatus)
            : "pending";

    const cfg        = STATUS_CONFIG[safeStatus];
    const safePercent = Math.max(0, Math.min(100, progress.percent ?? 0));
    const isFinished  = safeStatus === "done" || safeStatus === "failed";

    return (
        <div className={`w-full rounded-xl border border-border p-4 space-y-3 ${cfg.bg}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {cfg.icon}
                    <span className="text-sm font-medium font-['Syne',sans-serif]">
                        {cfg.label}
                    </span>
                </div>
                <span className="text-xs tabular-nums font-semibold font-['DM_Mono',monospace] text-muted-foreground">
                    {safePercent}%
                </span>
            </div>

            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-border">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                    style={{ width: `${safePercent}%` }}
                />
            </div>

            <p className="text-xs font-['DM_Mono',monospace] text-muted-foreground">
                {progress.message || "Preparing upload..."}
            </p>

            {isFinished && progress.updated_at && (
                <p className="text-[10px] font-['DM_Mono',monospace] text-muted-foreground">
                    Last updated: {new Date(progress.updated_at).toLocaleString()}
                </p>
            )}
        </div>
    );
}

// ── UploadPage ────────────────────────────────────────────────────────────────

export default function UploadPage() {
    const { props }  = usePage<PageProps>();
    const userId     = props.auth.user.id;

    const [file,      setFile]      = useState<File | null>(null);
    const [dragOver,  setDragOver]  = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress,  setProgress]  = useState<UploadProgress | null>(props.existingProgress ?? null);

    const inputRef = useRef<HTMLInputElement>(null);
    const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── WebSocket ─────────────────────────────────────────────────────────────

    useEffect(() => {
        echo
            .private(`upload.${userId}`)
            .listen(".progress.updated", (data: UploadProgress) => {
                setProgress(prev =>
                    !prev || new Date(data.updated_at) > new Date(prev.updated_at) ? data : prev
                );

                if (data.status === "done" || data.status === "failed") {
                    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
                }
            });

        return () => {
            echo.leave(`upload.${userId}`);
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        };
    }, [userId]);

    // ── Polling ───────────────────────────────────────────────────────────────

    const startPolling = (uploadId: string) => {
        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            try {
                const res  = await fetch(upload.progress(uploadId).url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
                const data: UploadProgress = await res.json();

                setProgress(prev =>
                    !prev || new Date(data.updated_at) > new Date(prev.updated_at) ? data : prev
                );

                if (data.status === "done" || data.status === "failed") {
                    clearInterval(pollRef.current!);
                    pollRef.current = null;
                }
            } catch {
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            }
        }, 3000);
    };

    useEffect(() => {
        if (progress?.upload_id && (progress.status === "pending" || progress.status === "processing")) {
            startPolling(progress.upload_id);
        }
        return () => {
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        };
    }, [progress?.upload_id, progress?.status]);

    // ── Handlers ──────────────────────────────────────────────────────────────

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

        try {
            const { default: axios } = await import("axios");
            const res  = await axios.post(upload.store().url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            const data = res.data;

            if (data.upload_id) {
                setProgress({ upload_id: data.upload_id, status: "pending", percent: 0, message: "Queued for processing...", updated_at: new Date().toISOString() });
                setFile(null);
                startPolling(data.upload_id);
            } else {
                toast.error(data.message ?? "Upload failed.");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "An error occurred. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const isActive = progress?.status === "pending" || progress?.status === "processing";

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {progress && <ProgressBar progress={progress} />}

            {!isActive && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                    {/* ── Upload card ───────────────────────────────────── */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="font-bold text-base font-['Syne',sans-serif]">Select File</h2>
                            <p className="text-xs mt-0.5 font-['DM_Mono',monospace] text-muted-foreground">
                                Accepts .xlsx, .xls, .csv — max 50MB
                            </p>
                        </div>

                        {/* Drop zone */}
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={`rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer
                                border-2 border-dashed transition-all duration-200
                                ${dragOver
                                    ? "border-primary bg-[color-mix(in_oklch,var(--primary)_5%,transparent)]"
                                    : "border-border hover:border-[color-mix(in_oklch,var(--primary)_50%,transparent)]"
                                }`}
                        >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]">
                                <Upload size={24} className="text-primary" />
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-semibold font-['Syne',sans-serif]">
                                    Drop file here or <span className="text-primary">browse</span>
                                </p>
                                <p className="text-xs mt-1 font-['DM_Mono',monospace] text-muted-foreground">
                                    XLSX · XLS · CSV
                                </p>
                            </div>

                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                            />
                        </div>

                        {/* Selected file */}
                        {file && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg
                                bg-[color-mix(in_oklch,var(--primary)_6%,transparent)]
                                border border-[color-mix(in_oklch,var(--primary)_25%,transparent)]">
                                <FileSpreadsheet size={18} className="text-primary flex-shrink-0" />
                                <span className="text-sm font-medium flex-1 truncate font-['DM_Mono',monospace]">
                                    {file.name}
                                </span>
                                <span className="text-xs flex-shrink-0 font-['DM_Mono',monospace] text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <button onClick={() => setFile(null)} className="text-zinc-400 hover:text-destructive transition-colors flex-shrink-0">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!file || uploading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg
                                font-semibold text-sm font-['Syne',sans-serif]
                                bg-primary text-primary-foreground
                                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? <><Loader size={16} className="animate-spin" /> Uploading...</>
                                       : <><Upload size={16} /> Upload & Import</>}
                        </button>
                    </div>

                    {/* ── Schema card ───────────────────────────────────── */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide mb-3
                            font-['DM_Mono',monospace] text-muted-foreground">
                            Expected Column Headers
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            {COLUMNS.map(([col]) => (
                                <div key={col}
                                    className="text-center px-2 py-1.5 rounded-lg text-xs font-semibold
                                        font-['DM_Mono',monospace] text-primary
                                        bg-[color-mix(in_oklch,var(--primary)_8%,transparent)]
                                        border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                                    {col}
                                </div>
                            ))}
                        </div>

                        <hr className="my-4 border-border" />

                        <p className="text-xs font-semibold uppercase tracking-wide mb-2
                            font-['DM_Mono',monospace] text-muted-foreground">
                            Column Descriptions
                        </p>

                        <div className="space-y-2">
                            {COLUMNS.map(([col, desc]) => (
                                <div key={col} className="flex items-start gap-2 text-xs">
                                    <span className="font-semibold flex-shrink-0 w-12 font-['DM_Mono',monospace] text-primary">
                                        {col}
                                    </span>
                                    <span className="text-muted-foreground">{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}