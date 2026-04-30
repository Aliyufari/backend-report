import { create } from "zustand";

interface LoaderStore {
    isLoading: boolean;
    isPaginationLoading: boolean;

    // Global page loader
    start: () => void;
    finish: () => void;

    // Table / partial loader
    startPagination: () => void;
    finishPagination: () => void;
}

export const useLoader = create<LoaderStore>((set) => ({
    isLoading: false,
    isPaginationLoading: false,

    // Full page loader
    start: () =>
        set({
            isLoading: true,
        }),

    finish: () =>
        set({
            isLoading: false,
        }),

    // Table / partial loader
    startPagination: () =>
        set({
            isPaginationLoading: true,
        }),

    finishPagination: () =>
        set({
            isPaginationLoading: false,
        }),
}));