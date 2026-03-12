/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LGA } from "@/pages/types/types";
import { getLGAs } from "@/services/backend.services";
import { useQuery } from "@tanstack/react-query";


const useLGAs = () => {
    const { data, isLoading, error } = useQuery<any, any>({
        queryKey: ["lgas"],
        queryFn: () => getLGAs().then(response => response.data?.lgas),
        staleTime: Infinity
    });

    return { 
        lgas: data as LGA[] || [],
        isLoading,
        error: error?.response?.data?.message || error?.message
    }
}

export default useLGAs;
