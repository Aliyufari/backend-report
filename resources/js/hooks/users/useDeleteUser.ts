/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultLinks } from "@/constants/constants";
import type { QueryProps, Session } from "@/pages/types/types";
import { deleteUser } from "@/services/backend.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UserMutationContextProps {
    previousContext: QueryProps<Session["user"][]> | undefined;
}

type Props = {
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const useDeleteUser = ({ onSuccess, onError }: Props) => {

    const queryClient = useQueryClient();
    return useMutation<string, any, any, UserMutationContextProps>({
        mutationFn: (id) => {
            return deleteUser(id).then((response: any) => response?.data);
        },
        onSuccess: (_resp, id) => {
            queryClient.setQueryData<QueryProps<Session["user"][]>>(["users"], (data) => {

                onSuccess("User delete successfully");
                return {
                    ...data,
                    data: (data?.data || []).filter(user => user.id !== id),
                    links: {
                        ...(data?.links ?? defaultLinks),
                        total: ((data?.links?.total ?? defaultLinks.total) - 1)
                    }
                };
            });
        },
        onError: (error, _newAdmin, context) => {
            if(error){ 
                onError(error.response ? error.response?.data?.message : error.message);
            }

            queryClient.setQueryData<UserMutationContextProps>(["users"], context);
        }
    });
}

export default useDeleteUser;