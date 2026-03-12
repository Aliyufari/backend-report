/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApplicants } from "@/services/backend.services";
import { useQuery } from "@tanstack/react-query";

// { page, pageSize }: { page?: number; pageSize?: number}
const useApplicants = () => {
    const { data, isLoading, error } = useQuery<any, any>({
        queryKey: ["applicants"],
        queryFn: () => getApplicants().then(response => response.data?.applicants),
        staleTime: 60 * 60 * 1000 // 1 hr
    });

    return { 
        applicants: data?.data || [],
        pagination: {
            total: data?.links?.total,
            per_page: data?.links?.per_page,
        },
        isLoading,
        error: error?.response?.data?.message || error?.message
    }
}

export default useApplicants;

