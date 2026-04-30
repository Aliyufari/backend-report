import { useLoader } from "@/hooks/useLoader";
import { router } from "@inertiajs/react";
import { Search, RefreshCw, Loader } from "lucide-react";
import { useState, useRef, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

export type ColumnType = "text" | "slot" | "actions" | "badge";

export interface Column<T> {
    key: string;
    label: string;
    type?: ColumnType;
    align?: "left" | "right" | "center";
    /** For nested keys like "pu.ward.name" */
    accessor?: (row: T) => ReactNode;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    value?: string;
}

export interface DataTableProps<T> {
    /** Paginated data from Inertia */
    data: Paginated<T>;
    /** Column definitions */
    columns: Column<T>[];
    /** Row key field (default: "id") */
    rowKey?: keyof T;
    /** Base URL for filter/search navigation */
    indexUrl: string;
    /** Current active filters */
    filters?: Record<string, string>;
    /** Filter dropdowns to render */
    filterConfigs?: FilterConfig[];
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Search filter key (default: "search") */
    searchKey?: string;
    /** Label shown in count row e.g. "users", "records" */
    noun?: string;
    /** Extra info after count e.g. "filtered by Admin" */
    countSuffix?: ReactNode;
    /** Render custom cells for slot columns */
    renderSlot?: (key: string, row: T, index: number) => ReactNode;
    /** Render action buttons per row */
    renderActions?: (row: T) => ReactNode;
    /** Empty state icon */
    emptyIcon?: ReactNode;
    /** Empty state message */
    emptyMessage?: string;
    /** Extra toolbar buttons (e.g. Add User) placed on the right */
    toolbarRight?: ReactNode;
    /** Whether to show the refresh button */
    showRefresh?: boolean;
    /** Only reload these props on refresh */
    reloadOnly?: string[];
    /** Additional query params preserved across navigations */
    extraParams?: Record<string, string>;
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────

function FilterSelect({
    value,
    onChange,
    children,
}: {
    value: string;
    onChange: (v: string) => void;
    children: ReactNode;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`appearance-none min-w-[110px] px-2.5 py-2 pr-7 rounded-lg border text-[12px]
                font-['DM_Mono',monospace] bg-background outline-none cursor-pointer transition-colors
                bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
                bg-no-repeat bg-[right_8px_center] focus:border-primary
                ${
                    value
                        ? "border-primary text-primary bg-[color-mix(in_oklch,var(--primary)_6%,var(--background))]"
                        : "border-border text-foreground"
                }`}
        >
            {children}
        </select>
    );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span
            onClick={onRemove}
            className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px]
                font-['DM_Mono',monospace] cursor-pointer transition-colors text-primary
                bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                border border-[color-mix(in_oklch,var(--primary)_25%,transparent)]
                hover:bg-[color-mix(in_oklch,var(--primary)_18%,transparent)]"
        >
            {label} ×
        </span>
    );
}

// ─── PaginationLoader overlay ─────────────────────────────────────────────────
function PaginationLoader() {
    const isPaginationLoading = useLoader((s) => s.isPaginationLoading);

    if (!isPaginationLoading) return null;

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
            <Loader
                size={28}
                className="text-primary animate-spin"
                strokeWidth={2.2}
            />
        </div>
    );
}

// ─── getValue helper ──────────────────────────────────────────────────────────

function getValue<T>(row: T, path: string): ReactNode {
    return path
        .split(".")
        .reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], row) as ReactNode;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    rowKey = "id" as keyof T,
    indexUrl,
    filters = {},
    filterConfigs = [],
    searchPlaceholder = "Search...",
    searchKey = "search",
    noun = "records",
    countSuffix,
    renderSlot,
    renderActions,
    emptyIcon,
    emptyMessage,
    toolbarRight,
    showRefresh = true,
    reloadOnly,
    extraParams = {},
}: DataTableProps<T>) {
    const [search, setSearch] = useState(filters[searchKey] ?? "");
    const [filterState, setFilterState] = useState<Record<string, string>>(
        Object.fromEntries(filterConfigs.map((f) => [f.key, f.value ?? ""]))
    );
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync filter state if configs change (e.g. on Inertia reload)
    useEffect(() => {
        setFilterState(
            Object.fromEntries(filterConfigs.map((f) => [f.key, f.value ?? ""]))
        );
    }, [filterConfigs.map((f) => f.value).join(",")]);

    // ── Navigation ────────────────────────────────────────────────────────────

    const DATATABLE_HEADER = {
        "x-datatable": "true",
    } as const;

    const navigate = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = { ...extraParams };

        const s = overrides[searchKey] ?? search;
        if (s) params[searchKey] = s;

        filterConfigs.forEach((f) => {
            const v = overrides[f.key] ?? filterState[f.key];
            if (v) params[f.key] = v;
        });

        useLoader.getState().startPagination();

        router.get(indexUrl, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            headers: DATATABLE_HEADER,
            onFinish: () => useLoader.getState().finishPagination(),
            onError: () => useLoader.getState().finishPagination(),
        });
    };

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate();
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(() => {
            navigate({ [searchKey]: val });
        }, 400);
    };

    const handleFilterChange = (key: string, val: string) => {
        const next = { ...filterState, [key]: val };
        setFilterState(next);
        navigate(next);
    };

    const handleRefresh = () => {
        useLoader.getState().startPagination();

        router.reload({
            only: reloadOnly,
            preserveUrl: true,
            headers: DATATABLE_HEADER,
            onFinish: () => useLoader.getState().finishPagination(),
            onError: () => useLoader.getState().finishPagination(),
        });
    };

    const clearAll = () => {
        setSearch("");
        setFilterState(
            Object.fromEntries(filterConfigs.map((f) => [f.key, ""]))
        );

        const { startPagination, finishPagination } = useLoader.getState();

        startPagination();

        router.get(indexUrl, extraParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            headers: DATATABLE_HEADER,
            onFinish: finishPagination,
            onError: finishPagination,
        });
    };

    // ── Active chips ──────────────────────────────────────────────────────────

    const activeChips: { label: string; onRemove: () => void }[] = [];

    if (search) {
        activeChips.push({
            label: `"${search}"`,
            onRemove: () => {
                setSearch("");
                navigate({ [searchKey]: "" });
            },
        });
    }

    filterConfigs.forEach((f) => {
        const v = filterState[f.key];
        if (!v) return;
        const opt = f.options.find((o) => o.value === v);
        activeChips.push({
            label: opt?.label ?? v,
            onRemove: () => handleFilterChange(f.key, ""),
        });
    });

    const hasFilters = activeChips.length > 0;

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

                    {/* Count */}
                    <p className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                        Showing {data.from ?? 0}–{data.to ?? 0} of {data.total} {noun}
                        {countSuffix && <span className="ml-2">{countSuffix}</span>}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">

                        {/* Filter dropdowns */}
                        {filterConfigs.map((f) => (
                            <FilterSelect
                                key={f.key}
                                value={filterState[f.key]}
                                onChange={(v) => handleFilterChange(f.key, v)}
                            >
                                <option value="">All {f.label}s</option>
                                {f.options.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </FilterSelect>
                        ))}

                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9 pr-3 py-2 w-[180px] focus:w-[220px] rounded-lg border border-border
                                    font-['DM_Mono',monospace] text-[12px] text-foreground bg-background
                                    placeholder:text-muted-foreground outline-none transition-all focus:border-primary"
                            />
                        </form>

                        {/* Refresh */}
                        {showRefresh && (
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border
                                    font-['DM_Mono',monospace] text-xs text-muted-foreground
                                    transition-all hover:bg-muted"
                            >
                                <RefreshCw size={13} />
                                Refresh
                            </button>
                        )}

                        {/* Extra right slot (e.g. Add button) */}
                        {toolbarRight}
                    </div>
                </div>

                {/* Active filter chips */}
                {hasFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                            Active filters:
                        </span>
                        {activeChips.map((chip, i) => (
                            <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
                        ))}
                        <button
                            onClick={clearAll}
                            className="font-['DM_Mono',monospace] text-[11px] text-destructive
                                bg-transparent border-none cursor-pointer"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div className="overflow-x-auto relative">
                <PaginationLoader />
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`font-['DM_Mono',monospace] text-[11px] font-medium uppercase
                                        tracking-[0.08em] text-muted-foreground px-3.5 py-2.5
                                        border-b border-border whitespace-nowrap
                                        ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-12 text-muted-foreground"
                                >
                                    {emptyIcon && (
                                        <div className="mx-auto mb-2.5 w-fit opacity-40">
                                            {emptyIcon}
                                        </div>
                                    )}
                                    <p className="font-['DM_Mono',monospace] text-[12px]">
                                        {emptyMessage ?? (hasFilters ? "No records match your filters" : "No records found")}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            data.data.map((row, index) => (
                                <tr
                                    key={String(row[rowKey])}
                                    className="border-b border-border last:border-0 transition-colors duration-[120ms]
                                        hover:bg-[color-mix(in_oklch,var(--primary)_4%,transparent)]"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-3.5 py-3 align-middle
                                                ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}
                                        >
                                            {col.type === "slot" && renderSlot
                                                ? renderSlot(col.key, row, index)
                                                : col.type === "actions" && renderActions
                                                ? renderActions(row)
                                                : col.accessor
                                                ? col.accessor(row)
                                                : (
                                                    <span className="font-['DM_Mono',monospace] text-[12px] text-foreground">
                                                        {getValue(row, col.key) ?? "—"}
                                                    </span>
                                                )
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {data.last_page > 1 && (
                <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t border-border">
                    {data.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => {
                                if (!link.url) return;

                                useLoader.getState().startPagination();

                                router.visit(link.url, {
                                    preserveState: true,
                                    preserveScroll: true,
                                    headers: DATATABLE_HEADER,
                                    onFinish: () => useLoader.getState().finishPagination(),
                                });
                            }}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`min-w-[32px] h-[32px] px-1.5 rounded-[7px] inline-flex items-center justify-center
                                font-['DM_Mono',monospace] text-[12px] border transition-all duration-150
                                disabled:opacity-35 disabled:cursor-not-allowed
                                ${
                                    link.active
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}