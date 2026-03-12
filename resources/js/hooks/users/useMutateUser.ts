/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultLinks } from "@/constants/constants";
import type { QueryProps, Session } from "@/pages/types/types";
import { createUser, updateUser } from "@/services/backend.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useStore } from "../../store/store";
// import { pageSize } from "../../constant/constant";

interface UserMutationContextProps {
    previousContext: QueryProps<Session["user"][]> | undefined;
}

type Props = {
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const useMutateUser = ({ onSuccess, onError }: Props) => {

    const queryClient = useQueryClient();
    return useMutation<Session["user"], any, any, UserMutationContextProps>({
        mutationFn: (user) => {
            if(user?.id){
                return updateUser(user).then((response) => response?.data?.user as Session["user"]);
            }
            
            return createUser(user).then((response: any) => response?.data?.user as Session["user"]);
        },
        onSuccess: (savedUser, newUser) => {
            queryClient.setQueryData<QueryProps<Session["user"][]>>(["users"], (data) => {

                if (newUser?.id) {
                    onSuccess("User updated successfully");
                    return {
                        ...data,
                        data: data?.data?.map(user => user.id === savedUser.id ? savedUser : user) || [],
                        links: data?.links ?? defaultLinks
                    };
                }

                onSuccess("User saved successfully");
                return {
                    ...data,
                    data: [savedUser, ...(data?.data || [])],
                    links: {
                        ...(data?.links ?? defaultLinks),
                        total: ((data?.links?.total ?? defaultLinks.total) + 1)
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

export default useMutateUser;