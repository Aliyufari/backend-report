import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { X, Loader } from "lucide-react";
import Portal from "@/components/Portal";
import staffRoutes from "@/routes/admin/staff";

interface Option { value: string; label: string; }
interface StateOption { id: string; name: string; }

interface StaffMember {
    id: string;
    staff_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    department: string;
    position: string | null;
    status: string;
    state_id: string | null;
    date_joined: string | null;
}

interface Props {
    open:        boolean;
    onClose:     () => void;
    states:      StateOption[];
    departments: Option[];
    statuses:    Option[];
    staff?:      StaffMember | null;
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

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-3 pb-1.5 border-b border-border font-['Syne',sans-serif] text-[12px] font-bold
            uppercase tracking-[0.08em] text-muted-foreground">
            {children}
        </p>
    );
}

const fieldCls = (error?: string) =>
    `w-full px-3 py-[8px] rounded-lg text-[13px] font-['DM_Mono',monospace]
     text-foreground bg-background outline-none transition-colors
     border ${error ? "border-destructive" : "border-border"} focus:border-primary`;

const selectCls = (error?: string) =>
    `${fieldCls(error)} appearance-none cursor-pointer pr-8
     bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
     bg-no-repeat bg-[right_12px_center]`;

export default function StaffModal({ open, onClose, states, departments, statuses, staff }: Props) {
    const isEdit = !!staff;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        staff_id:     staff?.staff_id     ?? "",
        first_name:   staff?.first_name   ?? "",
        last_name:    staff?.last_name    ?? "",
        email:        staff?.email        ?? "",
        phone:        staff?.phone        ?? "",
        department:   staff?.department   ?? "",
        position:     staff?.position     ?? "",
        status:       staff?.status       ?? "active",
        state_id:     staff?.state_id     ?? "",
        date_joined:  staff?.date_joined  ?? "",
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();

        if (staff) {
            setData({
                staff_id:    staff.staff_id,
                first_name:  staff.first_name,
                last_name:   staff.last_name,
                email:       staff.email ?? "",
                phone:       staff.phone ?? "",
                department:  staff.department,
                position:    staff.position ?? "",
                status:      staff.status,
                state_id:    staff.state_id ?? "",
                date_joined: staff.date_joined ?? "",
            });
        } else {
            reset();
            setData("status", "active");
        }
    }, [open, staff?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), preserveScroll: true };
        isEdit
            ? post(staffRoutes.update.url(staff!.id, { query: { _method: "PUT" } }), opts)
            : post(staffRoutes.store().url, opts);
    };

    if (!open) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto bg-black/50"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[640px]
                    shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit Staff Member" : "Add Staff Member"}
                        </h2>
                        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                        {errors.general && (
                            <div className="px-3 py-2.5 rounded-lg text-[12px] font-['DM_Mono',monospace]
                                bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] text-destructive">
                                {errors.general}
                            </div>
                        )}

                        {/* Identity */}
                        <div>
                            <SectionTitle>Staff Details</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Staff ID <span className="text-destructive">*</span></Label>
                                    <input
                                        className={fieldCls(errors.staff_id)}
                                        placeholder="INEC-0001"
                                        value={data.staff_id}
                                        onChange={e => setData("staff_id", e.target.value)}
                                    />
                                    <FieldError message={errors.staff_id} />
                                </div>

                                <div>
                                    <Label>Date Joined</Label>
                                    <input
                                        type="date"
                                        className={fieldCls(errors.date_joined)}
                                        value={data.date_joined}
                                        onChange={e => setData("date_joined", e.target.value)}
                                    />
                                    <FieldError message={errors.date_joined} />
                                </div>

                                <div>
                                    <Label>First Name <span className="text-destructive">*</span></Label>
                                    <input
                                        className={fieldCls(errors.first_name)}
                                        placeholder="Jane"
                                        value={data.first_name}
                                        onChange={e => setData("first_name", e.target.value)}
                                    />
                                    <FieldError message={errors.first_name} />
                                </div>

                                <div>
                                    <Label>Last Name <span className="text-destructive">*</span></Label>
                                    <input
                                        className={fieldCls(errors.last_name)}
                                        placeholder="Doe"
                                        value={data.last_name}
                                        onChange={e => setData("last_name", e.target.value)}
                                    />
                                    <FieldError message={errors.last_name} />
                                </div>

                                <div>
                                    <Label>Email</Label>
                                    <input
                                        type="email"
                                        className={fieldCls(errors.email)}
                                        placeholder="jane.doe@inec.gov.ng"
                                        value={data.email}
                                        onChange={e => setData("email", e.target.value)}
                                    />
                                    <FieldError message={errors.email} />
                                </div>

                                <div>
                                    <Label>Phone</Label>
                                    <input
                                        className={fieldCls(errors.phone)}
                                        placeholder="+234..."
                                        value={data.phone}
                                        onChange={e => setData("phone", e.target.value)}
                                    />
                                    <FieldError message={errors.phone} />
                                </div>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <SectionTitle>Department & Role</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Department <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.department)}
                                        value={data.department}
                                        onChange={e => setData("department", e.target.value)}
                                    >
                                        <option value="">Select department</option>
                                        {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                    <FieldError message={errors.department} />
                                </div>

                                <div>
                                    <Label>Position</Label>
                                    <input
                                        className={fieldCls(errors.position)}
                                        placeholder="e.g. Desk Officer"
                                        value={data.position}
                                        onChange={e => setData("position", e.target.value)}
                                    />
                                    <FieldError message={errors.position} />
                                </div>

                                <div>
                                    <Label>Status <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.status)}
                                        value={data.status}
                                        onChange={e => setData("status", e.target.value)}
                                    >
                                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <FieldError message={errors.status} />
                                </div>

                                <div>
                                    <Label>State <span className="text-[10px] text-muted-foreground">(leave blank for HQ)</span></Label>
                                    <select
                                        className={selectCls(errors.state_id)}
                                        value={data.state_id}
                                        onChange={e => setData("state_id", e.target.value)}
                                    >
                                        <option value="">HQ / National</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <FieldError message={errors.state_id} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold
                                    border border-border bg-transparent text-foreground cursor-pointer hover:bg-muted transition-colors"
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
                                {isEdit ? "Save Changes" : "Add Staff Member"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}