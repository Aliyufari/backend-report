/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from "@/pages/components/Modal";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserForm from "./UserForm";
import type { Session } from "@/pages/types/types";
import useUsers from "@/hooks/users/useUsers";
import GlobalLoader from "@/pages/components/GlobalLoader";
import useSession from "@/hooks/auth/useSession";
import useDeleteUser from "@/hooks/users/useDeleteUser";


export default function ManageUsers() {
    const [deleteInfo, setDeleteInfo] = useState({
        show: false,
        id: ""
    });
    const [userInfo, setUserInfo] = useState({
        user: {} as Session["user"],
        show: false
    });
    const { users, isLoading, error } = useUsers();
    const onDeleteUser = useDeleteUser({
        onError: (message: string) => { toast.error(message); },
        onSuccess: (message: string) => { 
            toast.success(message);
            setDeleteInfo({...deleteInfo, show: false, id: ""});
        }
    })
    const session = useSession();


    const handleDelete = () => {
        if(onDeleteUser.isPending){ return; }

        try {

            onDeleteUser.mutate(deleteInfo.id);

        } catch (error: any) {
            if(error.code === "ERR_NETWORK" || error.code === "ECONNABORTED"){ 
                toast.error("Network error, check your internet connection!"); 
            } else {
                toast.error(error.response?.data?.message || error.message);
            }
        }
    }

    if(isLoading){ return <GlobalLoader /> }
    if(error){
        return <p className="text-center text-secondary mt-10 px-6">{error}</p>
    }


    return (
        <>
            {/* Delete Modal */}
            <Modal
                show={deleteInfo.show}
                message="Did you want to delete this user?"
                loading={onDeleteUser.isPending}
                onClose={() => setDeleteInfo({...deleteInfo, show: false, id: ""})}
                onProceed={handleDelete}
            />

            {/* Add/Edit User */}
            <UserForm
                show={userInfo.show}
                user={userInfo.user}
                onClose={() => setUserInfo({...userInfo, show: false, user: {} as Session["user"]})}
            />

            <div className="flex justify-between items-center gap-4 mb-1">
                <h2 className="font-semibold md:text-lg text-zinc-600">Manage Roles</h2>
                <button onClick={() => setUserInfo({...userInfo, show: true})}
                    className="rounded-md bg-green-600 text-white hover:bg-green-500 transition-colors cursor-pointer py-2 px-5"
                >Add User</button>
            </div>
            <hr className="border-gray-300 mb-3" />

            <div className="w-full overflow-x-auto pb-2 no-scrollbarx">
                <table className="w-full whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#2f3349] text-white text-left">
                            <th className="p-4">First Name</th>
                            <th className="p-4">Last Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">LGA</th>
                            <th className="p-4">Role</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            users.filter(u => u.id !== session?.sub).map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={`${(index + 1) % 2 === 0 ? "bg-red-50" : "bg-gray-50"}  transition-colors"`}
                                >
                                    <td className="text-zinc-600 p-4">
                                        {user.first_name}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        {user.last_name}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        {user.email}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        {user?.lga?.name || "-- --"}
                                    </td>
                                    <td className="text-zinc-600 p-4 capitalize">
                                        {user.role?.replace("_", " ")}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        <div className="flex items-center gap-4">
                                            <Link to="#" onClick={() => setUserInfo({...userInfo, show: true, user})} className="inline-block text-blue-500 hover:text-blue-600 transition-all">
                                                <SquarePen size={24} />
                                            </Link>

                                            <Link to="#" onClick={() => setDeleteInfo({...deleteInfo, id: user.id, show: true})} className="inline-block text-red-500 hover:text-red-600 transition-all">
                                                <Trash2 size={24} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
