/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Session } from "@/pages/types/types";
import { getProfile } from "@/services/backend.services";
import { useQuery } from "@tanstack/react-query";


const useProfile = () => {
    const { data, isLoading, error } = useQuery<any, any>({
        queryKey: ["profile"],
        queryFn: () => getProfile().then(response => response.data?.user),
        staleTime: Infinity
    });

    return { 
        user: data as Session["user"] || null,
        isLoading,
        error: error?.response?.data?.message || error?.message
    }
}

export default useProfile;
