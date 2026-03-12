/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Session } from "@/pages/types/types";
import { getUsers } from "@/services/backend.services";
import { useQuery } from "@tanstack/react-query";

const useUsers = () => {
    const { data, isLoading, error } = useQuery<any, any>({
        queryKey: ["users"],
        queryFn: () => getUsers().then(response => response.data?.users),
        staleTime: 60 * 60 * 1000 // 1 hr
    });

    return { 
        users: data?.data as Session["user"][] || [],
        pagination: {
            total: data?.links?.total,
            per_page: data?.links?.per_page
        },
        isLoading,
        error: error?.response?.data?.message || error?.message
    }
}

export default useUsers;